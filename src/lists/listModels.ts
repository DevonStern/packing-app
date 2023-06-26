import { atom, AtomEffect, DefaultValue, RecoilValue, selector } from "recoil"
import { didItemChange, Item, parseItems } from "../items/itemModels"
import { v4 as uuid } from "uuid";
import { makePersistenceEffect } from "../utils/persistenceUtils";
import { makeUpdatedListsFromMasterListItem } from "../utils/itemUpdateUtils";
import { CreatedUpdated, Deletable, Sortable, WithId } from "../constants/modelConstants";
import { Storage } from "@capacitor/storage";
import { logChangesToServerData, logChangesToStoredData } from "../flags";
import { markDeletedInDynamoDb, putInDynamoDb } from "../utils/serverUtils";

const STORAGE_KEY_LISTS = 'lists'
export const TABLE_LISTS = 'List'

export interface List extends WithId, CreatedUpdated, Sortable {
	name: string
	items: Item[]
	isMaster: boolean
}

export type ServerList = Omit<List, 'items'> & { itemIds: string[] }

export const makeList = (name: string, sortOrder: number): List => ({
	id: uuid(),
	name,
	items: [],
	isMaster: false,
	createdOn: new Date(),
	updatedOn: new Date(),
	sortOrder,
})

export const parseLists = (savedLists: Partial<List>[]): List[] => {
	return savedLists.map<List>((list, i) => ({
		id: list.id!,
		name: list.name!,
		items: parseItems(list.items ?? []),
		isMaster: list.isMaster ?? false,
		createdOn: list.createdOn ? new Date(list.createdOn) : new Date(),
		updatedOn: list.updatedOn ? new Date(list.updatedOn) : new Date(),
		sortOrder: list.sortOrder ?? i,
	}))
}

const MASTER_LIST_ID = 'masterId'

const defaultMasterList: List = {
	id: MASTER_LIST_ID,
	name: 'Master',
	items: [],
	isMaster: true,
	createdOn: new Date(),
	updatedOn: new Date(),
	sortOrder: 0,
}

/**
 * Whenever items on the master list change, the corresponding items need to change on trip lists,
 * except for those attributes that have been overridden on the trip list items.
 */
const tripListItemsUpdaterEffect: AtomEffect<List[]> = ({ setSelf, onSet }) => {
	onSet((updatedLists, previousLists) => {
		if (previousLists instanceof DefaultValue) return

		const didMasterListChange: boolean = JSON.stringify(updatedLists[0]) !== JSON.stringify(previousLists[0])
		if (!didMasterListChange) return

		const updatedMasterListItems: Item[] = updatedLists[0].items.filter(masterListItem => {
			const previousItem: Item | undefined = previousLists[0].items.find(pi => pi.id === masterListItem.id)
			if (!previousItem) return false

			return didItemChange(previousItem, masterListItem)
		})
		const listsWithTripListItemsUpdated: List[] = updatedMasterListItems.reduce<List[]>(
			makeUpdatedListsFromMasterListItem,
			updatedLists
		)
		setSelf(listsWithTripListItemsUpdated)
	})
}

export const fetchedListsState = atom<(ServerList & Deletable)[]>({
	key: 'fetchedListsState',
	default: [],
})

/**
 * These effects need to be combined into a single effect so onSet doesn't get called
 * when setSelf gets called. That only works for the setSelf within the same effect.
 */
const listsEffect: AtomEffect<List[]> = ({ setSelf, onSet, getPromise }) => {

	const listsPersistenceInitEffect = (setSelf: (value: Promise<List[] | DefaultValue>) => void) => {
		setSelf(
			Storage.get({ key: STORAGE_KEY_LISTS })
				.then(({ value }) => {
					if (!value) return new DefaultValue()
					const restoredValue: List[] = parseLists(JSON.parse(value))
					if (logChangesToStoredData) console.log('restored from local storage', restoredValue)
					return restoredValue
				})
		)
	}

	const listsPersistenceOnSetEffect = (newValue: List[]) => {
		if (logChangesToStoredData) console.log('saving changes to state locally', newValue)
		Storage.set({ key: STORAGE_KEY_LISTS, value: JSON.stringify(newValue) })
	}

	const listsServerOnSetEffect = (getPromise: <S>(recoilValue: RecoilValue<S>) => Promise<S>) => {
		return (newRawValues: List[], oldRawValues: List[] | DefaultValue) => {
			if (oldRawValues instanceof DefaultValue) {
				console.debug('DefaultValue')
				//TODO: scan and see if any of the new values need to be uploaded (don't exist on server, were changed locally more recently, etc.)
				return
			}

			const newPreppedValues: ServerList[] = newRawValues.map<ServerList>(({ items, ...list }) => ({
				...list,
				itemIds: items.map(i => i.id),
			}))
			const oldPreppedValues: ServerList[] = oldRawValues.map<ServerList>(({ items, ...list }) => ({
				...list,
				itemIds: items.map(i => i.id),
			}))

			getPromise(fetchedListsState).then(fetchedValues => {
				const changedOrAddedValues: ServerList[] = newPreppedValues.filter(n => {
					const o = oldPreppedValues.find(possibleMatch => possibleMatch.id === n.id)
					const changedOrAdded: boolean = !o || JSON.stringify(o) !== JSON.stringify(n)
					return changedOrAdded
				})
				console.debug('before comparing changed to fetched', changedOrAddedValues)
				// Prevent sending to server when it was just fetched from server
				const differentFromServer: ServerList[] = changedOrAddedValues.filter(newValue => {
					const fetched = fetchedValues.find(possibleMatch => possibleMatch.id === newValue.id)
					const differentFromServer: boolean = !fetched || JSON.stringify(fetched) !== JSON.stringify(newValue)
					return differentFromServer
				})
				if (logChangesToServerData) console.log('saving changed or added values to server', differentFromServer)
				differentFromServer.forEach((value) => putInDynamoDb(TABLE_LISTS, value))

				const deletedValues: ServerList[] = oldPreppedValues.filter(o => {
					const n = newPreppedValues.find(possibleMatch => possibleMatch.id === o.id)
					const deleted: boolean = !n
					return deleted
				})
				console.debug('before comparing deleted to fetched', deletedValues)
				// Prevent sending to server when it was just fetched from server
				const notDeletedOnServer: ServerList[] = deletedValues.filter(oldValue => {
					const fetched = fetchedValues.find(possibleMatch => possibleMatch.id === oldValue.id)
					const notDeletedOnServer: boolean = !fetched || !fetched.hasOwnProperty('deleted')
					return notDeletedOnServer
				})
				if (logChangesToServerData) console.log('saving deleted values to server', notDeletedOnServer)
				notDeletedOnServer.forEach((value) => markDeletedInDynamoDb(TABLE_LISTS, value))
			})
		}
	}

	listsPersistenceInitEffect(setSelf) //Initialize from local storage first - sync will come after

	onSet(listsPersistenceOnSetEffect)
	onSet(listsServerOnSetEffect(getPromise))
}

export const listsState = atom<List[]>({
	key: 'listsState',
	default: [defaultMasterList],
	effects: [
		tripListItemsUpdaterEffect,
		listsEffect,
		// makePersistenceEffect(STORAGE_KEY_LISTS, parseLists),
	],
})

export const masterListState = selector<List>({
	key: 'masterListState',
	get: ({ get }) => {
		return get(listsState)[0]
	},
	set: ({ set }, updatedMasterList) => {
		if (updatedMasterList instanceof DefaultValue) {
			throw new Error("I don't know what the heck is going on.")
		}
		set(listsState, (prevLists) => [
			updatedMasterList,
			...prevLists.slice(1),
		])
	}
})
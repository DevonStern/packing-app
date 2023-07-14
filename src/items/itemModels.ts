import { v4 as uuid } from "uuid";
import { BasePerson } from "../persons/personModel";
import { BaseTag } from "../tags/tagModel";
import { CreatedUpdated, Deletable, Sortable, WithId } from "../constants/modelConstants";
import { DefaultValue, RecoilValue, atom } from "recoil";
import { List } from "../lists/listModels";
import { logChangesToServerData } from "../flags";
import { markDeletedInDynamoDb, putInDynamoDb } from "../utils/serverUtils";

export const TABLE_ITEMS = 'Item'

export interface Item extends WithId, CreatedUpdated, Sortable {
	listId: string
	assignedToListIds?: string[] //For master list items only
	overriddenProps?: ('name' | 'persons' | 'state' | 'tags')[] //For trip list items only
	name: string
	persons: ItemPerson[]
	state: ItemState
	tags: BaseTag[]
}

export const overridableProps: ('name' | 'persons' | 'state' | 'tags')[] = [
	'name',
	'persons',
	'state',
	'tags',
]

export enum ItemState {
	NEED,
	HAVE,
	PACKED,
	LOADED,
}

export interface ItemPerson {
	person: BasePerson
	state: ItemState
}

export const DEFAULT_ITEM_STATE = ItemState.NEED

export const makeItem = (listId: string, name: string, sortOrder: number): Item => ({
	id: uuid(),
	name,
	listId,
	persons: [],
	state: DEFAULT_ITEM_STATE,
	tags: [],
	createdOn: new Date(),
	updatedOn: new Date(),
	sortOrder,
})

// We have to be very specific in the parsers about what properties to include so we don't get unwanted properties
// (such as `serverUpdatedOn`).
export const parseItems = (savedItems: Partial<Item & Deletable>[]): Item[] => {
	return savedItems.map<Item>((item, i) => {
		const parsedItem = {
		id: item.id!,
		listId: item.listId!,
		assignedToListIds: item.assignedToListIds,
		overriddenProps: item.overriddenProps,
		name: item.name!,
		persons: item.persons ?? [],
		state: item.state ?? DEFAULT_ITEM_STATE,
		tags: item.tags ?? [],
		createdOn: item.createdOn ? new Date(item.createdOn) : new Date(),
		updatedOn: item.updatedOn ? new Date(item.updatedOn) : new Date(),
		sortOrder: item.sortOrder ?? i,
		}
		if (item.deleted) {
			return {
				...parsedItem,
				deleted: true,
			}
		}
		return parsedItem
	})
}

export const didItemChange = (previousItem: Item, currentItem: Item): boolean => {
	const {
		assignedToListIds: _p0,
		overriddenProps: _p1,
		createdOn: _p2,
		updatedOn: _p3,
		sortOrder: _p4,
		...previousItemToCompare
	} = previousItem
	const {
		assignedToListIds: _c0,
		overriddenProps: _c1,
		createdOn: _c2,
		updatedOn: _c3,
		sortOrder: _c4,
		...currentItemToCompare
	} = currentItem
	return JSON.stringify(currentItemToCompare) !== JSON.stringify(previousItemToCompare)
}

export const fetchedItemsState = atom<(Item & Deletable)[]>({
	key: 'fetchedItemsState',
	default: [],
})

const RECORD_TYPE = 'items'

export const itemsServerOnSetEffect = (getPromise: <S>(recoilValue: RecoilValue<S>) => Promise<S>) => {
	return (newListValues: List[], oldListValues: List[] | DefaultValue) => {
		if (oldListValues instanceof DefaultValue) {
			console.debug(`DefaultValue in ${RECORD_TYPE} server onSet effect`)
			//TODO: scan and see if any of the new values need to be uploaded (don't exist on server, were changed locally more recently, etc.)
			return
		}
		//TODO: fetch from server; do we need to include all from server, not just changes?
		
		const newItems: Item[] = newListValues.flatMap(list => list.items)
		const oldItems: Item[] = oldListValues.flatMap(list => list.items)

		getPromise(fetchedItemsState).then(fetchedValues => {
			const changedOrAddedValues = newItems.filter(n => {
				const o = oldItems.find(possibleMatch => possibleMatch.id === n.id)
				const changedOrAdded: boolean = !o || JSON.stringify(o) !== JSON.stringify(n)
				return changedOrAdded
			})
			console.debug('before comparing changed to fetched', changedOrAddedValues)
			// Prevent sending to server when it was just fetched from server
			const differentFromServer = changedOrAddedValues.filter(newValue => {
				const fetched = fetchedValues.find(possibleMatch => possibleMatch.id === newValue.id)
				const differentFromServer: boolean = !fetched || JSON.stringify(fetched) !== JSON.stringify(newValue)
				return differentFromServer
			})
			if (logChangesToServerData) console.log('saving changed or added values to server', differentFromServer)
			differentFromServer.forEach((value) => putInDynamoDb(TABLE_ITEMS, value))

			const deletedValues = oldItems.filter(o => {
				const n = newItems.find(possibleMatch => possibleMatch.id === o.id)
				const deleted: boolean = !n
				return deleted
			})
			console.debug('before comparing deleted to fetched', deletedValues)
			// Prevent sending to server when it was just fetched from server
			const notDeletedOnServer = deletedValues.filter(oldValue => {
				const fetched = fetchedValues.find(possibleMatch => possibleMatch.id === oldValue.id)
				const notDeletedOnServer: boolean = !fetched || !fetched.hasOwnProperty('deleted')
				return notDeletedOnServer
			})
			if (logChangesToServerData) console.log('saving deleted values to server', notDeletedOnServer)
			notDeletedOnServer.forEach((value) => markDeletedInDynamoDb(TABLE_ITEMS, value))
		})
	}
}
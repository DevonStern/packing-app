import { atom, AtomEffect, DefaultValue, selector } from "recoil"
import { Item, itemsRestorer } from "../items/itemModels"
import { v4 as uuid } from "uuid";
import { makePersistenceEffect } from "../utils/persistenceUtils";
import { getUpdatedListsFromMasterListItem } from "../utils/itemUpdateUtils";

export interface List {
	id: string
	name: string
	items: Item[]
	isMaster: boolean
}

export const makeList = (name: string): List => ({
	id: uuid(),
	name,
	items: [],
	isMaster: false,
})

const STORAGE_KEY_LISTS = 'lists'

const listsRestorer = (savedLists: any): List[] => {
	const lists: List[] = savedLists.map((list: List) => {
		const updatedItems: Item[] = itemsRestorer(list.items)
		const updatedList: List = {
			...list,
			items: updatedItems,
		}
		return updatedList
	})
	return lists
}

const MASTER_LIST_ID = 'masterId'

const defaultMasterList: List = {
	id: MASTER_LIST_ID,
	name: 'Master',
	items: [],
	isMaster: true,
}

const tripListItemsUpdaterEffect: AtomEffect<List[]> = ({ setSelf, onSet }) => {
	onSet((updatedLists, previousLists) => {
		if (previousLists instanceof DefaultValue) return

		const didMasterListChange: boolean = JSON.stringify(updatedLists[0]) !== JSON.stringify(previousLists[0])
		if (!didMasterListChange) return

		const updatedMasterListItems: Item[] = updatedLists[0].items.filter(masterListItem => {
			const previousItem: Item | undefined = previousLists[0].items.find(pi => pi.id === masterListItem.id)
			if (!previousItem) return false

			const { assignedToListIds: throwaway1, ...previousItemWithoutListIds } = previousItem
			const { assignedToListIds: throwaway2, ...currentItemWithoutListIds } = masterListItem
			const didItemChange: boolean = (
				JSON.stringify(currentItemWithoutListIds) !== JSON.stringify(previousItemWithoutListIds)
			)
			return didItemChange
		})
		const listsWithTripListItemsUpdated: List[] = updatedMasterListItems.reduce<List[]>(
			(listsAccumulator, masterListItem) => {
				return getUpdatedListsFromMasterListItem(listsAccumulator, masterListItem)
			},
			updatedLists
		)
		setSelf(listsWithTripListItemsUpdated)
	})
}

export const listsState = atom<List[]>({
	key: 'listsState',
	default: [defaultMasterList],
	effects: [
		tripListItemsUpdaterEffect,
		makePersistenceEffect(STORAGE_KEY_LISTS, listsRestorer),
	],
})

export const masterListState = selector<List>({
	key: 'masterListState',
	get: ({ get }) => {
		return get(listsState)[0]
	},
	set: ({ get, set }, updatedMasterList) => {
		if (updatedMasterList instanceof DefaultValue) {
			throw new Error("I don't know what the heck is going on.")
		}
		const updatedLists: List[] = [
			updatedMasterList,
			...get(listsState).slice(1)
		]
		set(listsState, updatedLists)
	}
})
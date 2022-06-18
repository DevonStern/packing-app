import { atom, DefaultValue, selector, selectorFamily } from "recoil"
import { Item, itemsRestorer } from "../items/itemModel"
import { v4 as uuid } from "uuid";
import { makePersistenceEffect } from "../utils/persistenceUtils";

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

export const listsState = atom<List[]>({
	key: 'listsState',
	default: [defaultMasterList],
	effects: [
		makePersistenceEffect(STORAGE_KEY_LISTS, listsRestorer)
	],
})

export const listState = selectorFamily<List, string>({
	key: 'listState',
	get: (id) => ({ get }) => {
		const currentValue: List | undefined = get(listsState).find(value => value.id === id)
		if (!currentValue) {
			throw new Error("Where'd the thing go?")
		}
		return currentValue
	},
	set: (id) => ({ get, set }, updatedValue) => {
		if (updatedValue instanceof DefaultValue) {
			throw new Error("I don't know what the heck is going on.")
		}
		const currentValue: List | undefined = get(listsState).find(value => value.id === id)
		if (!currentValue) {
			throw new Error("Where'd the thing go?")
		}
		const updatedValues: List[] = get(listsState).map(value => {
			if (currentValue.id === value.id) {
				return updatedValue
			}
			return value
		})
		set(listsState, updatedValues)
	},
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
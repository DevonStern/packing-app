import { atom } from "recoil"
import { Item, itemsRestorer } from "../items/ItemModel"
import { v4 as uuid } from "uuid";
import { makeCurrentObjectSelector, makePersistenceEffect } from "../utils/persistenceUtils";

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
	name: 'Master List',
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

export const currentListIdState = atom<string | undefined>({
	key: 'currentListIdState',
	default: MASTER_LIST_ID,
})

export const currentListState = makeCurrentObjectSelector('currentListState', listsState, currentListIdState)
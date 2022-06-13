import { atom, DefaultValue, selector } from "recoil"
import { v4 as uuid } from "uuid";
import { currentListState, List } from "../lists/ListModel";
import { Person } from "../persons/PersonModel";
import { makeCurrentObjectSelector } from "../utils/persistenceUtils";

export interface Item {
	id: string
	name: string
	persons: Person[]
	state: ItemState
}

export enum ItemState {
	NEED,
	HAVE,
	PACKED,
	LOADED,
}

const DEFAULT_ITEM_STATE = ItemState.NEED

export const makeItem = (name: string): Item => ({
	id: uuid(),
	name,
	persons: [],
	state: DEFAULT_ITEM_STATE,
})

export const itemsRestorer = (savedItems: any): Item[] => {
	const items: Item[] = savedItems.map((item: Item) => {
		const state: ItemState = item.state ?? DEFAULT_ITEM_STATE
		const persons: Person[] = item.persons ?? []
		const updatedItem: Item = {
			...item,
			state,
			persons,
		}
		return updatedItem
	})
	return items
}

export const itemsState = selector<Item[]>({
	key: 'itemsState',
	get: ({ get }) => {
		return get(currentListState).items
	},
	set: ({ get, set }, updatedItems) => {
		if (updatedItems instanceof DefaultValue) {
			throw new Error("I don't know what the heck is going on.")
		}
		const updatedList: List = {
			...get(currentListState),
			items: updatedItems
		}
		set(currentListState, updatedList)
	}
})

export const currentItemIdState = atom<string | undefined>({
	key: 'currentItemIdState',
	default: undefined,
})

export const currentItemState = makeCurrentObjectSelector('currentItemState', itemsState, currentItemIdState)
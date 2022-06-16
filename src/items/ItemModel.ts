import { DefaultValue, selectorFamily } from "recoil"
import { v4 as uuid } from "uuid";
import { listState, List } from "../lists/ListModel";
import { Person } from "../persons/PersonModel";

export interface Item {
	id: string
	name: string
	persons: ItemPerson[]
	state: ItemState
}

export enum ItemState {
	NEED,
	HAVE,
	PACKED,
	LOADED,
}

export interface ItemPerson {
	person: Person
	state: ItemState
}

export const DEFAULT_ITEM_STATE = ItemState.NEED

export const makeItem = (name: string): Item => ({
	id: uuid(),
	name,
	persons: [],
	state: DEFAULT_ITEM_STATE,
})

export const itemsRestorer = (savedItems: any): Item[] => {
	const items: Item[] = savedItems.map((item: Item) => {
		const state: ItemState = item.state ?? DEFAULT_ITEM_STATE
		const persons: ItemPerson[] = item.persons ?? []
		const updatedItem: Item = {
			...item,
			state,
			persons,
		}
		return updatedItem
	})
	return items
}

export const itemsState = selectorFamily<Item[], string>({
	key: 'itemsState',
	get: (id) => ({ get }) => {
		return get(listState(id)).items
	},
	set: (id) => ({ get, set }, updatedItems) => {
		if (updatedItems instanceof DefaultValue) {
			throw new Error("I don't know what the heck is going on.")
		}
		const updatedList: List = {
			...get(listState(id)),
			items: updatedItems
		}
		set(listState(id), updatedList)
	}
})

interface Ids {
	listId: string
	itemId: string
	toJSON(): string
}

export const itemState = selectorFamily<Item, Ids>({
	key: 'itemState',
	get: ({ listId, itemId }) => ({ get }) => {
		const currentValue: Item | undefined = get(itemsState(listId)).find(value => value.id === itemId)
		if (!currentValue) {
			throw new Error("Where'd the thing go?")
		}
		return currentValue
	},
	set: ({ listId, itemId }) => ({ get, set }, updatedValue) => {
		if (updatedValue instanceof DefaultValue) {
			throw new Error("I don't know what the heck is going on.")
		}
		const currentValue: Item | undefined = get(itemsState(listId)).find(value => value.id === itemId)
		if (!currentValue) {
			throw new Error("Where'd the thing go?")
		}
		const updatedValues: Item[] = get(itemsState(listId)).map(value => {
			if (currentValue.id === value.id) {
				return updatedValue
			}
			return value
		})
		set(itemsState(listId), updatedValues)
	},
})
import { atom, AtomEffect, DefaultValue, selectorFamily } from "recoil"
import { Storage } from "@capacitor/storage";

export interface Item {
	id: string
	name: string
	state: ItemState
}

export enum ItemState {
	NEED,
	HAVE,
	PACKED,
	LOADED,
}

const startingItems: Item[] = [
	{ id: '1', name: 'Test', state: ItemState.NEED },
	{ id: '2', name: 'Test 2', state: ItemState.NEED },
	{ id: '3', name: 'Test 3', state: ItemState.NEED },
]

const itemPersistenceEffect: AtomEffect<Item[]> = ({setSelf, onSet}) => {
	Storage.get({ key: 'items' })
		.then(({ value }) => {
			if (!value) return
			setSelf(JSON.parse(value))
		})
	
	onSet(newValue => {
		Storage.set({ key: 'items', value: JSON.stringify(newValue) })
	})
}

export const itemsState = atom<Item[]>({
	key: 'itemsState',
	default: startingItems,
	effects: [
		itemPersistenceEffect,
	],
})

export const currentItemIdState = atom<string | undefined>({
	key: 'currentItemIdState',
	default: undefined,
})

export const currentItemState = selectorFamily<Item, string | undefined>({
	key: 'currentItemState',
	get: id => ({ get }) => {
		if (!id) {
			throw new Error("Where's the ID?")
		}
		const currentItem: Item | undefined = get(itemsState).find(item => item.id === id)
		if (!currentItem) {
			throw new Error("Where'd the item go?")
		}
		return currentItem
	},
	set: id => ({ get, set }, updatedItem) => {
		if (!id) {
			throw new Error("Where's the ID?")
		}
		if (updatedItem instanceof DefaultValue) {
			throw new Error("I don't know what the heck is going on.")
		}
		const currentItem: Item | undefined = get(itemsState).find(item => item.id === id)
		if (!currentItem) {
			throw new Error("Where'd the item go?")
		}
		const updatedItems: Item[] = get(itemsState).map(item => {
			if (currentItem.id === item.id) {
				return updatedItem
			}
			return item
		})
		set(itemsState, updatedItems)
	},
})
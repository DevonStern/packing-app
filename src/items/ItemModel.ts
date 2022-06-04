import { atom, AtomEffect } from "recoil"
import { Storage } from "@capacitor/storage";

export interface Item {
	id: string
	name: string
}

const startingItems: Item[] = [
	{ id: '1', name: 'Test' },
	{ id: '2', name: 'Test 2' },
	{ id: '3', name: 'Test 3' },
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
import { atom } from "recoil"

export interface Item {
	id: string
	name: string
}

const startingItems: Item[] = [
	{ id: '1', name: 'Test' },
	{ id: '2', name: 'Test 2' },
	{ id: '3', name: 'Test 3' },
]

export const itemsState = atom<Item[]>({
	key: 'itemsState',
	default: startingItems,
})
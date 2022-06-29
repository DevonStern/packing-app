import { atom } from "recoil";
import { Item } from "../items/itemModels";

export const multiSelectState = atom<boolean>({
	key: 'multiSelectState',
	default: false,
})

export const selectedItemsState = atom<Item[]>({
	key: 'selectedItemsState',
	default: [],
})
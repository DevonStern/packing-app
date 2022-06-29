import { v4 as uuid } from "uuid";
import { Person } from "../persons/personModel";

export interface Item {
	id: string
	assignedToListIds?: string[] //For master list items only
	overriddenProps?: ('name' | 'persons' | 'state' | 'tags')[] //For trip list items only
	name: string
	persons: ItemPerson[]
	state: ItemState
	tags: string[]
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
	tags: [],
})

export const itemsRestorer = (savedItems: any): Item[] => {
	const items: Item[] = savedItems.map((item: Item) => {
		const state: ItemState = item.state ?? DEFAULT_ITEM_STATE
		const persons: ItemPerson[] = item.persons ?? []
		const tags: string[] = item.tags ?? []
		const updatedItem: Item = {
			...item,
			state,
			persons,
			tags,
		}
		return updatedItem
	})
	return items
}
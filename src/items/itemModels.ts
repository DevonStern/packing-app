import { v4 as uuid } from "uuid";
import { BasePerson } from "../persons/personModel";
import { BaseTag } from "../tags/tagModel";
import { CreatedUpdated, Sortable, WithId } from "../constants/modelConstants";

export interface Item extends WithId, CreatedUpdated, Sortable {
	assignedToListIds?: string[] //For master list items only
	overriddenProps?: ('name' | 'persons' | 'state' | 'tags')[] //For trip list items only
	name: string
	persons: ItemPerson[]
	state: ItemState
	tags: BaseTag[] //TODO: Change tags to just the IDs, get rid of BaseTag
}

export const overridableProps: ('name' | 'persons' | 'state' | 'tags')[] = [
	'name',
	'persons',
	'state',
	'tags',
]

export enum ItemState {
	NEED,
	HAVE,
	PACKED,
	LOADED,
}

export interface ItemPerson {
	person: BasePerson // TODO: Change person to just the ID, get rid of BasePerson
	state: ItemState
}

export const DEFAULT_ITEM_STATE = ItemState.NEED

export const makeItem = (name: string, sortOrder: number): Item => ({
	id: uuid(),
	name,
	persons: [],
	state: DEFAULT_ITEM_STATE,
	tags: [],
	createdOn: new Date(),
	updatedOn: new Date(),
	sortOrder,
})

export const parseItems = (savedItems: Partial<Item>[]): Item[] => {
	return savedItems.map<Item>((item, i) => ({
		...item,
		id: item.id!,
		name: item.name!,
		persons: item.persons ?? [],
		state: item.state ?? DEFAULT_ITEM_STATE,
		tags: item.tags ?? [],
		createdOn: item.createdOn ? new Date(item.createdOn) : new Date(),
		updatedOn: item.updatedOn ? new Date(item.updatedOn) : new Date(),
		sortOrder: item.sortOrder ?? i,
	}))
}

export const didItemChange = (previousItem: Item, currentItem: Item): boolean => {
	const {
		assignedToListIds: _p0,
		overriddenProps: _p1,
		createdOn: _p2,
		updatedOn: _p3,
		sortOrder: _p4,
		...previousItemToCompare
	} = previousItem
	const {
		assignedToListIds: _c0,
		overriddenProps: _c1,
		createdOn: _c2,
		updatedOn: _c3,
		sortOrder: _c4,
		...currentItemToCompare
	} = currentItem
	return JSON.stringify(currentItemToCompare) !== JSON.stringify(previousItemToCompare)
}
import { Item, overridableProps } from "../items/itemModels"
import { List } from "../lists/listModels"

export const makeUpdatedListsFromMasterListItem = (lists: List[], masterListItem: Item): List[] => {
	if (!masterListItem.assignedToListIds || masterListItem.assignedToListIds.length === 0) {
		return lists
	}

	const assignedListIds: string[] = masterListItem.assignedToListIds
	const updatedLists: List[] = lists.map(list => {
		if (assignedListIds.includes(list.id)) {
			return makeUpdatedListFromMasterListItem(list, masterListItem)
		}
		return list
	})
	return updatedLists
}

const makeUpdatedListFromMasterListItem = (list: List, masterListItem: Item): List => {
	const updatedItems: Item[] = list.items.map(item => {
		if (item.id === masterListItem.id) {
			return makeUpdatedListItemFromMasterListItem(item, masterListItem)
		}
		return item
	})
	const updatedList: List = {
		...list,
		items: updatedItems
	}
	return updatedList
}

const makeUpdatedListItemFromMasterListItem = (item: Item, masterListItem: Item): Item => {
	const nonOverridenPropChanged: boolean = overridableProps.some((overridableProp) => {
		if (item.overriddenProps?.includes(overridableProp)) return false

		return JSON.stringify(item[overridableProp]) !== JSON.stringify(masterListItem[overridableProp])
	})
	const newUpdatedOn: Date = nonOverridenPropChanged ? new Date() : item.updatedOn
	const updatedItem: Item = {
		...item,
		name: item.overriddenProps?.includes('name') ? item.name : masterListItem.name,
		persons: item.overriddenProps?.includes('persons') ? item.persons : masterListItem.persons,
		state: item.overriddenProps?.includes('state') ? item.state : masterListItem.state,
		tags: item.overriddenProps?.includes('tags') ? item.tags : masterListItem.tags,
		updatedOn: newUpdatedOn,
	}
	return updatedItem
}
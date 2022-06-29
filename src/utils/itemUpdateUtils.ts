import { Item } from "../items/itemModels"
import { List } from "../lists/listModels"

export const getUpdatedListsFromMasterListItem = (lists: List[], masterListItem: Item): List[] => {
	if (!masterListItem.assignedToListIds || masterListItem.assignedToListIds.length === 0) {
		return lists
	}

	const assignedListIds: string[] = masterListItem.assignedToListIds
	const updatedLists: List[] = lists.map(list => {
		if (assignedListIds.includes(list.id)) {
			return getUpdatedListFromMasterListItem(list, masterListItem)
		}
		return list
	})
	return updatedLists
}

const getUpdatedListFromMasterListItem = (list: List, masterListItem: Item): List => {
	const updatedItems: Item[] = list.items.map(item => {
		if (item.id === masterListItem.id) {
			return getUpdatedListItemFromMasterListItem(item, masterListItem)
		}
		return item
	})
	const updatedList: List = {
		...list,
		items: updatedItems
	}
	return updatedList
}

const getUpdatedListItemFromMasterListItem = (item: Item, masterListItem: Item): Item => {
	const updatedItem: Item = {
		...item,
		name: item.overriddenProps?.includes('name') ? item.name : masterListItem.name,
		persons: item.overriddenProps?.includes('persons') ? item.persons : masterListItem.persons,
		state: item.overriddenProps?.includes('state') ? item.state : masterListItem.state,
		tags: item.overriddenProps?.includes('tags') ? item.tags : masterListItem.tags,
	}
	return updatedItem
}
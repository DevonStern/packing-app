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
		name: masterListItem.name,
		persons: masterListItem.persons,
		state: masterListItem.state,
		tags: masterListItem.tags,
	}
	return updatedItem
}
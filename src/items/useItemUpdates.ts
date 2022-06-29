import { useSetRecoilState } from "recoil";
import { List, listsState } from "../lists/listModels";
import { Item } from "./itemModels";

const useItemUpdates = () => {
	const setLists = useSetRecoilState(listsState)

	// const updateItemsFromMasterListItem = (masterListItem: Item) => {
	// 	console.log('update from master list item', masterListItem)
	// 	// if (!masterListItem.assignedToListIds) return

	// 	// const assignedListIds: string[] = masterListItem.assignedToListIds
	// 	// setLists(previousLists => {
	// 	// 	return previousLists.map(list => {
	// 	// 		if (assignedListIds.includes(list.id)) {
	// 	// 			return getUpdatedListFromMasterListItem(list, masterListItem)
	// 	// 		}
	// 	// 		return list
	// 	// 	})
	// 	// })
	// }

	// const getUpdatedListFromMasterListItem = (list: List, masterListItem: Item): List => {
	// 	const updatedItems: Item[] = list.items.map(item => {
	// 		if (item.id === masterListItem.id) {
	// 			return getUpdatedListItemFromMasterListItem(item, masterListItem)
	// 		}
	// 		return item
	// 	})
	// 	const updatedList: List = {
	// 		...list,
	// 		items: updatedItems
	// 	}
	// 	return updatedList
	// }

	// const getUpdatedListItemFromMasterListItem = (item: Item, masterListItem: Item): Item => {
	// 	const updatedItem: Item = {
	// 		...item,
	// 		name: masterListItem.name,
	// 		persons: masterListItem.persons,
	// 		state: masterListItem.state,
	// 		tags: masterListItem.tags,
	// 	}
	// 	return updatedItem
	// }

	const getItemWithOverriddenPropIfNeeded = (
		list: List,
		item: Item,
		overridenPropKey: 'name' | 'persons' | 'state' | 'tags'
	): Item => {
		if (list.isMaster) {
			return item
		}

		if (item.overriddenProps?.includes(overridenPropKey)) {
			return item
		} else {
			const updatedItem: Item = {
				...item,
				overriddenProps: [
					...(item.overriddenProps ?? []),
					overridenPropKey,
				]
			}
			return updatedItem
		}
	}

	return {
		// updateItemsFromMasterListItem,
		getItemWithOverriddenPropIfNeeded,
	}
}

export default useItemUpdates

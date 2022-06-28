import { useRecoilState, useSetRecoilState } from "recoil"
import { List, listsState, masterListState } from "../lists/listModel"
import { Item } from "./itemModel"

const useItems = (list: List) => {
	const setLists = useSetRecoilState(listsState)
	const [masterList, setMasterList] = useRecoilState(masterListState)

	const addItems = (selectedItems: Item[]) => {
		addItemsToList(selectedItems)
		addListToMasterItems(selectedItems)
	}

	const addItemsToList = (selectedItems: Item[]) => {
		const selectedItemsWithoutListIds: Item[] = selectedItems.map<Item>(item => ({
			...item,
			assignedToListIds: undefined
		}))
		const updatedItems: Item[] = [
			...list.items,
			...selectedItemsWithoutListIds
		]
		const updatedList: List = {
			...list,
			items: updatedItems
		}
		setLists(previousLists => {
			return previousLists.map(l => {
				if (l.id === list.id) {
					return updatedList
				}
				return l
			})
		})
	}

	const addListToMasterItems = (selectedItems: Item[]) => {
		const selectedItemsWithListIds: Item[] = selectedItems.map<Item>(item => ({
			...item,
			assignedToListIds: getAssignedToListIds(item)
		}))
		const updatedMasterItems: Item[] = masterList.items.map(item => {
			const selectedItem: Item | undefined = selectedItemsWithListIds.find(selectedItem => selectedItem.id === item.id)
			if (selectedItem) {
				return selectedItem
			}
			return item
		})
		const updatedMasterList: List = {
			...masterList,
			items: updatedMasterItems
		}
		setMasterList(updatedMasterList)
	}

	const getAssignedToListIds = (item: Item): string[] => {
		if (item.assignedToListIds) {
			return [
				...item.assignedToListIds,
				list.id
			]
		}
		return [list.id]
	}
	
	const deleteItem = (item: Item) => {
		if (list.isMaster) {
			deleteItemFromLinkedLists(item)
		} else {
			deleteLinkFromMasterListItem(item)
		}
		deleteItemFromList(item)
	}

	const deleteItemFromLinkedLists = (item: Item) => {
		const listIds: string[] = item.assignedToListIds ?? []
		setLists((previousLists) => {
			return previousLists.map(l => {
				if (listIds.includes(l.id)) {
					return getListWithItemRemoved(l, item)
				}
				return l
			})	
		})
	}

	const getListWithItemRemoved = (l: List, item: Item): List => {
		const updatedItems: Item[] = l.items.filter(i => i.id !== item.id)
		const updatedList: List = {
			...l,
			items: updatedItems
		}
		return updatedList
	}

	const deleteLinkFromMasterListItem = (item: Item) => {
		const masterListItem: Item | undefined = masterList.items.find(i => i.id === item.id)
		if (!masterListItem) {
			throw new Error(`Master list item not found - id = ${list.id}`)
		}
		const updatedAssignedToListIds: string[] | undefined = masterListItem.assignedToListIds ?
			masterListItem.assignedToListIds.filter(id => id !== list.id) :
			undefined
		const updatedMasterListItem: Item = {
			...masterListItem,
			assignedToListIds: updatedAssignedToListIds
		}
		const updatedMasterListItems: Item[] = masterList.items.map(i => {
			if (i.id === item.id) {
				return updatedMasterListItem
			}
			return i
		})
		setMasterList((previousMasterList) => ({
			...previousMasterList,
			items: updatedMasterListItems
		}))
	}

	const deleteItemFromList = (item: Item) => {
		const updatedList: List = getListWithItemRemoved(list, item)
		setLists((previousLists) => {
			return previousLists.map(l => {
				if (l.id === list.id) {
					return updatedList
				}
				return l
			})
		})
	}

	return {
		addItems,
		deleteItem,
	}
}

export default useItems
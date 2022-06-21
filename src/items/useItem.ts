import { useRecoilState, useSetRecoilState } from "recoil"
import { List, listsState, masterListState } from "../lists/listModel"
import { Item } from "./itemModel"

const useItem = (list: List, item: Item) => {
	const setLists = useSetRecoilState(listsState)
	const [masterList, setMasterList] = useRecoilState(masterListState)
	
	const deleteItem = () => {
		if (list.isMaster) {
			deleteItemFromLinkedLists()
		} else {
			deleteLinkFromMasterListItem()
		}
		deleteItemFromList()
	}

	const deleteItemFromLinkedLists = () => {
		const listIds: string[] = item.assignedToListIds ?? []
		setLists((previousLists) => {
			return previousLists.map(l => {
				if (listIds.includes(l.id)) {
					return getListWithItemRemoved(l)
				}
				return l
			})	
		})
	}

	const getListWithItemRemoved = (l: List): List => {
		const updatedItems: Item[] = l.items.filter(i => i.id !== item.id)
		const updatedList: List = {
			...l,
			items: updatedItems
		}
		return updatedList
	}

	const deleteLinkFromMasterListItem = () => {
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

	const deleteItemFromList = () => {
		const updatedList: List = getListWithItemRemoved(list)
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
		deleteItem,
	}
}

export default useItem
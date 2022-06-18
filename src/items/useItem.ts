import { useRecoilState } from "recoil"
import { List, masterListState } from "../lists/ListModel"
import { Item, itemsState } from "./ItemModel"

const useItem = (list: List, item: Item) => {
	const [items, setItems] = useRecoilState(itemsState(list.id))
	const [masterList, setMasterList] = useRecoilState(masterListState)
	
	const deleteItem = () => {
		deleteItemFromList()
		deleteLinkFromMasterListItem()
	}

	const deleteItemFromList = () => {
		const newItems: Item[] = items.filter(i => i.id !== item.id)
		setItems(newItems)
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
		const updatedMasterList: List = {
			...masterList,
			items: updatedMasterListItems
		}
		setMasterList(updatedMasterList)
	}

	return {
		deleteItem,
	}
}

export default useItem
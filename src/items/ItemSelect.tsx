import { IonButton, IonList } from "@ionic/react"
import { useState } from "react"
import { useRecoilState } from "recoil"
import { List, masterListState } from "../lists/ListModel"
import { Item, itemsState } from "./ItemModel"
import ItemSelectRow from "./ItemSelectRow"

interface ItemSelectProps {
	list: List
}

const ItemSelect: React.FC<ItemSelectProps> = ({ list }) => {
	const [items, setItems] = useRecoilState(itemsState(list.id))
	const [masterList, setMasterList] = useRecoilState(masterListState)

	const [selectedItems, setSelectedItems] = useState<Item[]>([])

	const addItems = () => {
		addItemsToList()
		addListToMasterItems()
	}

	const addItemsToList = () => {
		const selectedItemsWithoutListIds: Item[] = selectedItems.map<Item>(item => ({
			...item,
			assignedToListIds: undefined
		}))
		const updatedItems: Item[] = [
			...items,
			...selectedItemsWithoutListIds
		]
		setItems(updatedItems)
	}

	const addListToMasterItems = () => {
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

	return (
		<>
			<IonList>
				{masterList.items.map(item => {
					const isInList: boolean = items.some(i => item.id === i.id)
					if (isInList) {
						return null
					}
					return (
						<ItemSelectRow
							key={item.id}
							item={item}
							selectedItems={selectedItems}
							setSelectedItems={setSelectedItems}
						/>
					)
				})}
			</IonList>
			<IonButton expand="block" onClick={addItems}>
				Add
			</IonButton>
		</>
	)
}

export default ItemSelect
import { IonButton, IonList } from "@ionic/react"
import { useState } from "react"
import { useRecoilValue } from "recoil"
import { List, masterListState } from "../lists/listModel"
import { Item, itemsState } from "./itemModel"
import ItemSelectRow from "./ItemSelectRow"
import useItems from "./useItems"

interface ItemSelectProps {
	list: List
}

const ItemSelect: React.FC<ItemSelectProps> = ({ list }) => {
	const items = useRecoilValue(itemsState(list.id))
	const masterList = useRecoilValue(masterListState)

	const [selectedItems, setSelectedItems] = useState<Item[]>([])

	const { addItems } = useItems(list)

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
			<IonButton expand="block" onClick={() => addItems(selectedItems)}>
				Add
			</IonButton>
		</>
	)
}

export default ItemSelect
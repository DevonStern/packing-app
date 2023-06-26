import { IonButton, IonList } from "@ionic/react"
import { useState } from "react"
import { useRecoilValue } from "recoil"
import { List, masterListState } from "../lists/listModels"
import { Item } from "./itemModels"
import ItemSelectRow from "./ItemSelectRow"
import useListItems from "./useListItems"

interface ItemSelectProps {
	list: List
}

const ItemSelect: React.FC<ItemSelectProps> = ({ list }) => {
	const masterList = useRecoilValue(masterListState)

	const [selectedItems, setSelectedItems] = useState<Item[]>([])

	const { assignItems: addItems } = useListItems(list.id)

	return (
		<>
			<IonList>
				{masterList.items.map(item => {
					const isInList: boolean = list.items.some(i => item.id === i.id)
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
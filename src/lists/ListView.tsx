import { IonList } from "@ionic/react"
import { useState } from "react"
import AddItemInput from "../items/AddItemInput"
import ItemRow from "../items/ItemRow"
import { List } from "./listModel"
import Modal from "../general/Modal"
import ItemSelect from "../items/ItemSelect"
import Fab from "../general/Fab"
import { multiSelectState } from "./ListPage"
import { useRecoilValue } from "recoil"
import ItemSelectRow from "../items/ItemSelectRow"
import { Item } from "../items/itemModel"

interface ListViewProps {
	list: List
}

const ListView: React.FC<ListViewProps> = ({ list }) => {
	const isMultiSelectMode = useRecoilValue(multiSelectState)

	const [isAddItemInputOpen, setIsAddItemInputOpen] = useState<boolean>(false)
	const [selectedItems, setSelectedItems] = useState<Item[]>([])

	return (
		<>
			<IonList>
				{list.items.map(item => {
					if (isMultiSelectMode) {
						return <ItemSelectRow
							key={item.id}
							item={item}
							selectedItems={selectedItems}
							setSelectedItems={setSelectedItems}
						/>
					}
					return <ItemRow key={item.id} list={list} item={item} />
				})}
			</IonList>
			<Fab onClick={() => setIsAddItemInputOpen(true)} />
			<Modal isOpen={isAddItemInputOpen} setIsOpen={setIsAddItemInputOpen}>
				{list.isMaster ?
					<AddItemInput list={list} />
					:
					<ItemSelect list={list} />
				}
			</Modal>
		</>
	)
}

export default ListView
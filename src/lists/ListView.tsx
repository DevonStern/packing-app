import { IonList } from "@ionic/react"
import { useState } from "react"
import AddItemInput from "../items/AddItemInput"
import ItemRow from "../items/ItemRow"
import { List } from "./listModels"
import Modal from "../general/Modal"
import ItemSelect from "../items/ItemSelect"
import Fab from "../general/Fab"
import { useRecoilState, useRecoilValue } from "recoil"
import ItemSelectRow from "../items/ItemSelectRow"
import { multiSelectState, selectedItemsState } from "../state/state"
import MultiSelectActions from "../general/MultiSelectActions"

interface ListViewProps {
	list: List
}

const ListView: React.FC<ListViewProps> = ({ list }) => {
	const isMultiSelectMode = useRecoilValue(multiSelectState)
	const [selectedItems, setSelectedItems] = useRecoilState(selectedItemsState)

	const [isAddItemInputOpen, setIsAddItemInputOpen] = useState<boolean>(false)

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
			{!isMultiSelectMode ?
				<Fab onClick={() => setIsAddItemInputOpen(true)} />
				:
				<MultiSelectActions list={list} />
			}
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
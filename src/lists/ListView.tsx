import { IonFab, IonFabButton, IonIcon, IonList } from "@ionic/react"
import { useState } from "react"
import AddItemInput from "../items/AddItemInput"
import ItemRow from "../items/ItemRow"
import { List } from "./listModel"
import { add } from 'ionicons/icons';
import Modal from "../general/Modal"
import ItemSelect from "../items/ItemSelect"

interface ListViewProps {
	list: List
}

const ListView: React.FC<ListViewProps> = ({ list }) => {
	const [isAddItemInputOpen, setIsAddItemInputOpen] = useState<boolean>(false)

	return (
		<>
			<IonList>
				{list.items.map(item => {
					return <ItemRow key={item.id} list={list} item={item} />
				})}
			</IonList>
			<IonFab horizontal="center" vertical="bottom" style={{ paddingBottom: '60px' }}>
				<IonFabButton onClick={() => setIsAddItemInputOpen(true)}>
					<IonIcon icon={add} size="large" />
				</IonFabButton>
			</IonFab>
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
import { IonFab, IonFabButton, IonIcon, IonList } from "@ionic/react"
import { useState } from "react"
import { useRecoilValue } from "recoil"
import AddItemInput from "../items/AddItemInput"
import ItemRow from "../items/ItemRow"
import { currentListState } from "./ListModel"
import { add } from 'ionicons/icons';
import Modal from "../general/Modal"

const ListView: React.FC = () => {
	const currentList = useRecoilValue(currentListState)
	
	const [isAddItemInputOpen, setIsAddItemInputOpen] = useState<boolean>(false)

	return (
		<>
			<IonList>
				{currentList.items.map(item => {
					return <ItemRow key={item.id} item={item} />
				})}
			</IonList>
			<IonFab horizontal="center" vertical="bottom" style={{ paddingBottom: '60px' }}>
				<IonFabButton onClick={() => setIsAddItemInputOpen(true)}>
					<IonIcon icon={add} size="large" />
				</IonFabButton>
			</IonFab>
			<Modal isOpen={isAddItemInputOpen} setIsOpen={setIsAddItemInputOpen}>
				<AddItemInput />
			</Modal>
		</>
	)
}

export default ListView
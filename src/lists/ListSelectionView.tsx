import { IonFab, IonFabButton, IonIcon, IonList } from "@ionic/react"
import { add } from "ionicons/icons"
import { useState } from "react"
import { useRecoilValue } from "recoil"
import Modal from "../general/Modal"
import AddListInput from "./AddListInput"
import { listsState } from "./ListModel"
import ListRow from "./ListRow"

const ListSelectionView: React.FC = () => {
	const lists = useRecoilValue(listsState)

	const [isAddListInputOpen, setIsAddListInputOpen] = useState<boolean>(false)

	return (
		<>
			<IonList>
				{lists.map(list => {
					if (list.isMaster) {
						return null
					}
					return <ListRow key={list.id} list={list} />
				})}
			</IonList>
			<IonFab horizontal="center" vertical="bottom" style={{ paddingBottom: '60px' }}>
				<IonFabButton onClick={() => setIsAddListInputOpen(true)}>
					<IonIcon icon={add} size="large" />
				</IonFabButton>
			</IonFab>
			<Modal isOpen={isAddListInputOpen} setIsOpen={setIsAddListInputOpen}>
				<AddListInput />
			</Modal>
		</>
	)
}

export default ListSelectionView
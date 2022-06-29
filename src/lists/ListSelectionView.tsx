import { IonList } from "@ionic/react"
import { useState } from "react"
import { useRecoilValue } from "recoil"
import Fab from "../general/Fab"
import Modal from "../general/Modal"
import AddListInput from "./AddListInput"
import { listsState } from "./listModels"
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
			<Fab onClick={() => setIsAddListInputOpen(true)} />
			<Modal isOpen={isAddListInputOpen} setIsOpen={setIsAddListInputOpen}>
				<AddListInput />
			</Modal>
		</>
	)
}

export default ListSelectionView
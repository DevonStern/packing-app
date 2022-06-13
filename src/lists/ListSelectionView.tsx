import { IonFab, IonFabButton, IonIcon, IonList } from "@ionic/react"
import { add } from "ionicons/icons"
import { useState } from "react"
import { useRecoilValue } from "recoil"
import AddListInput from "./AddListInput"
import { listsState } from "./ListModel"
import ListRow from "./ListRow"

const ListSelectionView: React.FC = () => {
	const lists = useRecoilValue(listsState)

	const [isAddListInputOpen, setIsListItemInputOpen] = useState<boolean>(false)

	return (
		<>
			<IonList>
				{lists.map(list => {
					if (list.isMaster) {
						return <div key={list.id} style={{ border: '3px solid black' }}>
							<ListRow list={list} />
						</div>
					}
					return <ListRow key={list.id} list={list} />
				})}
			</IonList>
			<IonFab horizontal="center" vertical="bottom" style={{ paddingBottom: '60px' }}>
				<IonFabButton onClick={() => setIsListItemInputOpen(true)}>
					<IonIcon icon={add} size="large" />
				</IonFabButton>
			</IonFab>
			<AddListInput isOpen={isAddListInputOpen} setIsOpen={setIsListItemInputOpen} />
		</>
	)
}

export default ListSelectionView
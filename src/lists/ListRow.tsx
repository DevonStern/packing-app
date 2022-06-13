import { IonIcon, IonItem, IonItemOption, IonItemOptions, IonItemSliding } from "@ionic/react"
import { trash } from "ionicons/icons"
import { useHistory } from "react-router"
import { useRecoilState, useSetRecoilState } from "recoil"
import { List, listsState, currentListIdState } from "./ListModel"

interface ListRowProps {
	list: List
}

const ListRow: React.FC<ListRowProps> = ({ list }) => {
	const [lists, setLists] = useRecoilState(listsState)
	const setCurrentListId = useSetRecoilState(currentListIdState)

	const history = useHistory()

	const goToList = () => {
		setCurrentListId(list.id)
		history.push(`/list/${list.id}`)
	}

	const deleteList = () => {
		const newLists: List[] = lists.filter(l => l.id !== list.id)
		setLists(newLists)
	}

	return (
		<>
			<IonItemSliding>
				<IonItem onClick={goToList}>
					{list.name}
				</IonItem>
				<IonItemOptions side="start">
					<IonItemOption color="danger" onClick={deleteList}>
						<IonIcon slot="icon-only" icon={trash} size="large" />
					</IonItemOption>
				</IonItemOptions>
			</IonItemSliding>
		</>
	)
}

export default ListRow
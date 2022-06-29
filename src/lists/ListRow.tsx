import { IonIcon, IonItem, IonItemOption, IonItemOptions, IonItemSliding } from "@ionic/react"
import { trash } from "ionicons/icons"
import { useHistory } from "react-router-dom"
import { List } from "./listModels"
import useLists from "./useLists"

interface ListRowProps {
	list: List
}

const ListRow: React.FC<ListRowProps> = ({ list }) => {
	const history = useHistory()
	const { deleteList } = useLists()

	const goToList = () => {
		history.push(`/list/${list.id}`)
	}

	return (
		<>
			<IonItemSliding>
				<IonItem onClick={goToList}>
					{list.name}
				</IonItem>
				<IonItemOptions side="start">
					<IonItemOption color="danger" onClick={() => deleteList(list.id)}>
						<IonIcon slot="icon-only" icon={trash} size="large" />
					</IonItemOption>
				</IonItemOptions>
			</IonItemSliding>
		</>
	)
}

export default ListRow
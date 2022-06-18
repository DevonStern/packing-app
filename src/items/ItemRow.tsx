import { IonBadge, IonIcon, IonItem, IonItemOption, IonItemOptions, IonItemSliding } from "@ionic/react"
import { trash } from "ionicons/icons"
import { useHistory } from "react-router-dom"
import useItemInfo from "./useItemInfo"
import { List } from "../lists/ListModel"
import { Item, ItemState } from "./ItemModel"
import useItem from "./useItem"

interface ItemRowProps {
	list: List
	item: Item
}

const ItemRow: React.FC<ItemRowProps> = ({ list, item }) => {
	const history = useHistory()
	const { lowestItemState, stateText } = useItemInfo(item)
	const { deleteItem } = useItem(list, item)

	const goToItem = () => {
		if (list.isMaster) {
			history.push(`/masterList/${list.id}/item/${item.id}`)
		} else {
			history.push(`/list/${list.id}/item/${item.id}`)
		}
	}

	return (
		<>
			<IonItemSliding>
				<IonItem onClick={goToItem}>
					{item.name}
					&nbsp;
					<IonBadge
						mode="ios"
						color={lowestItemState === ItemState.LOADED ? 'success' : 'secondary'}
					>
						{stateText}
					</IonBadge>
					{item.persons.map(ip => (
						<IonBadge
							key={ip.person.id}
							slot="end"
							mode="ios"
							color={ip.state === ItemState.LOADED ? 'success' : 'primary'}
						>
							{ip.person.name.slice(0, 1)}
						</IonBadge>
					))}
				</IonItem>
				<IonItemOptions side="start">
					<IonItemOption color="danger" onClick={deleteItem}>
						<IonIcon slot="icon-only" icon={trash} size="large" />
					</IonItemOption>
				</IonItemOptions>
			</IonItemSliding>
		</>
	)
}

export default ItemRow
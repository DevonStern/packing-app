import { IonBadge, IonChip, IonIcon, IonItem, IonItemOption, IonItemOptions, IonItemSliding, IonLabel } from "@ionic/react"
import { trash } from "ionicons/icons"
import { useHistory } from "react-router-dom"
import useItemInfo from "./useItemInfo"
import { List } from "../lists/listModel"
import { Item, ItemState } from "./itemModel"
import useItem from "./useItem"

interface ItemRowProps {
	list: List
	item: Item
}

const ItemRow: React.FC<ItemRowProps> = ({ list, item }) => {
	const history = useHistory()
	const { stateText, isItemFullyLoaded } = useItemInfo(item)
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
					<IonLabel>{item.name}</IonLabel>
					<IonChip
						color={isItemFullyLoaded ? 'success' : 'secondary'}
						outline={!isItemFullyLoaded}
					>
						{stateText}
					</IonChip>
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
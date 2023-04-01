import { IonBadge, IonIcon, IonItem, IonItemOption, IonItemOptions, IonItemSliding, IonLabel } from "@ionic/react"
import { arrowForwardCircle, trash } from "ionicons/icons"
import { useHistory } from "react-router-dom"
import { List } from "../lists/listModels"
import { Item, ItemState } from "./itemModels"
import useListItems from "./useListItems"
import ItemStateChip from "./ItemStateChip"
import useItemState from "./useItemState"

interface ItemRowProps {
	list: List
	item: Item
}

const ItemRow: React.FC<ItemRowProps> = ({ list, item }) => {
	const history = useHistory()
	const { advanceItemPersonState, deleteItem } = useListItems(list)
	const { moveWholeState } = useItemState(list, item)

	const goToItem = () => {
		if (list.isMaster) {
			history.push(`/masterList/${list.id}/item/${item.id}`)
		} else {
			history.push(`/list/${list.id}/item/${item.id}`)
		}
	}

	const advanceState = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
		event.stopPropagation()
		moveWholeState()
	}

	return (
		<>
			<IonItemSliding>
				<IonItem onClick={goToItem}>
					<IonLabel>{item.name}</IonLabel>
					{item.persons.map(ip => (
						<IonBadge
							key={ip.person.id}
							mode="ios"
							color={ip.state === ItemState.LOADED ? 'success' : (
								ip.state === ItemState.PACKED ? 'tertiary' : 'secondary'
							)}
							onClick={(event) => {
								advanceItemPersonState(item, ip)
								event.stopPropagation()
							}}
						>
							{ip.person.name.slice(0, 1)}
						</IonBadge>
					))}
					<ItemStateChip item={item} />
					<div onClick={advanceState}>
						<IonIcon
							size="large"
							color="primary"
							icon={arrowForwardCircle}
						/>
					</div>
				</IonItem>
				<IonItemOptions side="start">
					<IonItemOption color="danger" onClick={() => deleteItem(item)}>
						<IonIcon slot="icon-only" icon={trash} size="large" />
					</IonItemOption>
				</IonItemOptions>
			</IonItemSliding>
		</>
	)
}

export default ItemRow
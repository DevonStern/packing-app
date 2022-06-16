import { IonBadge, IonIcon, IonItem, IonItemOption, IonItemOptions, IonItemSliding } from "@ionic/react"
import { trash } from "ionicons/icons"
import { useHistory } from "react-router"
import { useRecoilState } from "recoil"
import useItemInfo from "../hooks/useItemInfo"
import { List } from "../lists/ListModel"
import { Item, itemsState, ItemState } from "./ItemModel"

interface ItemRowProps {
	list: List
	item: Item
}

const ItemRow: React.FC<ItemRowProps> = ({ list, item }) => {
	const [items, setItems] = useRecoilState(itemsState(list.id))

	const history = useHistory()
	const { lowestItemState, stateText } = useItemInfo(item)

	const goToItem = () => {
		history.push(`/list/${list.id}/item/${item.id}`)
	}

	const deleteItem = () => {
		const newItems: Item[] = items.filter(i => i.id !== item.id)
		setItems(newItems)
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
import { IonIcon, IonItem, IonItemOption, IonItemOptions, IonItemSliding } from "@ionic/react"
import { trash } from "ionicons/icons"
import { useHistory } from "react-router"
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil"
import { currentListIdState } from "../lists/ListModel"
import { currentItemIdState, Item, itemsState } from "./ItemModel"

interface ItemRowProps {
	item: Item
}

const ItemRow: React.FC<ItemRowProps> = ({ item }) => {
	const [items, setItems] = useRecoilState(itemsState)
	const setCurrentItemId = useSetRecoilState(currentItemIdState)
	const listId = useRecoilValue(currentListIdState)

	const history = useHistory()

	const goToItem = () => {
		setCurrentItemId(item.id)
		history.push(`/list/${listId}/item/${item.id}`)
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
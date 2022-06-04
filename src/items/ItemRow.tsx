import { IonIcon, IonItem, IonItemOption, IonItemOptions, IonItemSliding } from "@ionic/react"
import { trash } from "ionicons/icons"
import { useRecoilState } from "recoil"
import { Item, itemsState } from "./ItemModel"

interface ItemRowProps {
	item: Item
}

const ItemRow: React.FC<ItemRowProps> = ({ item }) => {
	const [items, setItems] = useRecoilState(itemsState)

	const deleteItem = () => {
		const newItems: Item[] = items.filter(i => i.id !== item.id)
		setItems(newItems)
	}
	
	return (
		<>
			<IonItemSliding>
				<IonItem>
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
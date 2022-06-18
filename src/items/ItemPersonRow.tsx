import { IonItem, IonLabel } from "@ionic/react"
import { useSetRecoilState } from "recoil"
import { List } from "../lists/listModel"
import { getItemPersonWithNextState } from "../utils/itemStateUtils"
import { Item, ItemPerson, itemState, ItemState } from "./itemModel"
import MoveItemStateButton from "./MoveItemStateButton"

interface ItemPersonRowProps {
	list: List
	item: Item
	itemPerson: ItemPerson
}

const ItemPersonRow: React.FC<ItemPersonRowProps> = ({ list, item, itemPerson }) => {
	const setItem = useSetRecoilState(itemState({
		listId: list.id,
		itemId: item.id,
		toJSON: () => JSON.stringify({ listId: list.id, itemId: item.id }),
	}))
	
	const { person, state } = itemPerson

	const moveItemPersonState = () => {
		const updatedItemPerson: ItemPerson = getItemPersonWithNextState(itemPerson)
		const updatedItemPersons: ItemPerson[] = item.persons.map(ip => {
			if (ip.person.id === itemPerson.person.id) {
				return updatedItemPerson
			}
			return ip
		})
		const updatedItem: Item = {
			...item,
			persons: updatedItemPersons
		}
		setItem(updatedItem)
	}

	return (
		<IonItem lines="none">
			<IonLabel>{person.name}'s {item.name}: {ItemState[state]}</IonLabel>
			<MoveItemStateButton
				state={state}
				onClick={moveItemPersonState}
			/>
		</IonItem>
	)
}

export default ItemPersonRow
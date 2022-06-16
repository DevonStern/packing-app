import { IonItem, IonLabel } from "@ionic/react"
import { useRecoilState } from "recoil"
import { List } from "../lists/ListModel"
import { getItemPersonWithNextState } from "../utils/utils"
import { currentItemState, Item, ItemPerson, ItemState } from "./ItemModel"
import MoveItemStateButton from "./MoveItemStateButton"

interface ItemPersonRowProps {
	list: List
	item: Item
	itemPerson: ItemPerson
}

const ItemPersonRow: React.FC<ItemPersonRowProps> = ({ list, item, itemPerson }) => {
	const [blah, setItem] = useRecoilState(currentItemState)

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
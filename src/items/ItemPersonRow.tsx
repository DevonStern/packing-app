import { IonChip, IonItem, IonLabel } from "@ionic/react"
import { List } from "../lists/listModels"
import { isLastItemState } from "../utils/itemStateUtils"
import { Item, ItemPerson, ItemState } from "./itemModels"
import MoveItemStateButton from "./MoveItemStateButton"
import useListItems from "./useListItems"

interface ItemPersonRowProps {
	list: List
	item: Item
	itemPerson: ItemPerson
}

const ItemPersonRow: React.FC<ItemPersonRowProps> = ({ list, item, itemPerson }) => {
	const { advanceItemPersonState } = useListItems(list)
	
	const { person, state } = itemPerson

	return (
		<IonItem lines="none">
			<IonLabel>
				{person.name}'s {item.name}:
			</IonLabel>
			<IonChip
				color={isLastItemState(state) ? 'success' : 'secondary'}
				outline={!isLastItemState(state)}
			>
				{ItemState[state]}
			</IonChip>
			→&nbsp;
			<MoveItemStateButton
				state={state}
				onClick={() => advanceItemPersonState(item, itemPerson)}
			/>
		</IonItem>
	)
}

export default ItemPersonRow
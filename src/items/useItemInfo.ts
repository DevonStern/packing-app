import { Item, ItemState } from "./ItemModel";
import { getLowestItemState } from "../utils/itemStateUtils";

const ItemInfo = (item: Item) => {
	const hasPersons: boolean = item.persons.length > 0
	const lowestItemState: ItemState = hasPersons ? getLowestItemState(item.persons) : item.state
	const stateText: string = ItemState[lowestItemState]

	return {
		hasPersons,
		lowestItemState,
		stateText,
	}
}

export default ItemInfo
import { Item, ItemState } from "./itemModel";
import { getLowestItemState } from "../utils/itemStateUtils";

const ItemInfo = (item: Item) => {
	const hasPersons: boolean = item.persons.length > 0
	const lowestItemState: ItemState = hasPersons ? getLowestItemState(item.persons) : item.state
	const stateText: string = ItemState[lowestItemState]
	const isItemFullyLoaded: boolean = lowestItemState === ItemState.LOADED

	return {
		hasPersons,
		lowestItemState,
		stateText,
		isItemFullyLoaded,
	}
}

export default ItemInfo
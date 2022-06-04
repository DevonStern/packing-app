import { ItemState } from "../items/ItemModel";

export const getNextItemState = (currentValue: ItemState): ItemState => {
	//All keys and values are included in the array for reverse lookup, so divide by 2
	const numValues: number = Object.values(ItemState).length / 2
	const nextValue: number = currentValue + 1 < numValues ? currentValue + 1 : 0
	const nextName: string = ItemState[nextValue]
	const nextState: ItemState = ItemState[nextName as keyof typeof ItemState]
	return nextState
}
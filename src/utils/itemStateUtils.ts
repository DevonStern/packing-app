import { ItemPerson, ItemState } from "../items/itemModel";

export const getItemStateKeys = (): string[] => {
	const keys: string[] = Object.keys(ItemState)
	//All keys and values are included in the array for reverse lookup, so get first half
	return keys.slice(0, keys.length / 2)
}

export const getItemStateValues = (): (string | ItemState)[] => {
	const values: (string | ItemState)[] = Object.values(ItemState)
	//All keys and values are included in the array for reverse lookup, so get first half
	return values.slice(0, values.length / 2)
}

export const getNextItemState = (currentValue: ItemState): ItemState => {
	//All keys and values are included in the array for reverse lookup, so divide by 2
	const numValues: number = Object.values(ItemState).length / 2
	const nextValue: number = currentValue + 1 < numValues ? currentValue + 1 : currentValue
	const nextName: string = ItemState[nextValue]
	const nextState: ItemState = ItemState[nextName as keyof typeof ItemState]
	return nextState
}

export const isLastItemState = (value: ItemState): boolean => {
	//All keys AND values are included in the array (for reverse lookup), so divide by 2 to get just values
	const numStates: number = Object.values(ItemState).length / 2
	return value.valueOf() === numStates - 1
}

export const getLowestItemState = (itemPersons: ItemPerson[]): ItemState => {
	const states: ItemState[] = itemPersons.map(({ state }) => state)
	const lowestState: ItemState = states.reduce((currentLowestState, currentState) => {
		if (currentState.valueOf() < currentLowestState.valueOf()) {
			return currentState
		}
		return currentLowestState
	}, ItemState.LOADED)
	return lowestState
}

export const getItemPersonWithNextState = (itemPerson: ItemPerson): ItemPerson => {
	if (isLastItemState(itemPerson.state)) return itemPerson
	
	const nextState: ItemState = getNextItemState(itemPerson.state)
	const updatedItemPerson: ItemPerson = {
		...itemPerson,
		state: nextState
	}
	return updatedItemPerson
}
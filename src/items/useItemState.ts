import { List } from "../lists/listModels"
import { getItemPersonWithNextState, getNextItemState, isLastItemState } from "../utils/itemStateUtils"
import { Item, ItemPerson, ItemState } from "./itemModels"
import useItemInfo from "./useItemInfo"
import useItemUpdates from "./useItemUpdates"
import useListItems from "./useListItems"

const useItemState = (list: List, item: Item) => {
	const { setItem } = useListItems(list)
	const { getItemWithOverriddenPropIfNeeded } = useItemUpdates()
	const { hasPersons, lowestItemState } = useItemInfo(item)

	const moveWholeState = () => {
		if (hasPersons) {
			moveLowestItemPersonStates()
		} else {
			moveMainItemState()
		}
	}

	const moveLowestItemPersonStates = () => {
		const itemWithOverriddenProp: Item = getItemWithOverriddenPropIfNeeded(list, item, 'persons')
		const itemPersonsWithLowestState: ItemPerson[] = itemWithOverriddenProp.persons.filter(ip => ip.state === lowestItemState)
		const updatedItemPersons: ItemPerson[] = itemWithOverriddenProp.persons.map(ip => {
			const isPersonInLowestState: boolean = itemPersonsWithLowestState.some(lowestIP => lowestIP.person.id === ip.person.id)
			if (isPersonInLowestState) {
				return getItemPersonWithNextState(ip)
			}
			return ip
		})
		const updatedItem: Item = {
			...itemWithOverriddenProp,
			persons: updatedItemPersons
		}
		setItem(item, updatedItem)
	}

	const moveMainItemState = () => {
		if (isLastItemState(item.state)) return

		const itemWithOverriddenProp: Item = getItemWithOverriddenPropIfNeeded(list, item, 'state')
		const nextState: ItemState = getNextItemState(itemWithOverriddenProp.state)
		const updatedItem: Item = {
			...itemWithOverriddenProp,
			state: nextState,
		}
		setItem(item, updatedItem)
	}

	const setWholeState = (state: ItemState) => {
		if (hasPersons) {
			setItemPersonStates(state)
		} else {
			setMainItemState(state)
		}
	}

	const setItemPersonStates = (state: ItemState) => {
		const itemWithOverriddenProp: Item = getItemWithOverriddenPropIfNeeded(list, item, 'persons')
		const updatedItemPersons: ItemPerson[] = itemWithOverriddenProp.persons.map(ip => {
			return {
				...ip,
				state
			}
		})
		const updatedItem: Item = {
			...itemWithOverriddenProp,
			persons: updatedItemPersons
		}
		setItem(item, updatedItem)
	}

	const setMainItemState = (state: ItemState) => {
		const itemWithOverriddenProp: Item = getItemWithOverriddenPropIfNeeded(list, item, 'state')
		const updatedItem: Item = {
			...itemWithOverriddenProp,
			state
		}
		setItem(item, updatedItem)
	}

	return {
		moveWholeState,
		setWholeState,
	}
}

export default useItemState
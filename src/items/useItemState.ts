import { List } from "../lists/listModels"
import { makeItemPersonWithNextState, getNextItemState, isLastItemState } from "../utils/itemStateUtils"
import { Item, ItemPerson, ItemState } from "./itemModels"
import useItemInfo from "./useItemInfo"
import useItemUpdates from "./useItemUpdates"
import useListItems from "./useListItems"

const useItemState = (list: List, item: Item) => {
	const { setItem } = useListItems(list.id)
	const { makeItemWithOverriddenPropIfNeeded } = useItemUpdates(list.isMaster)
	const { hasPersons, lowestItemState } = useItemInfo(item)

	const moveWholeState = () => {
		if (hasPersons) {
			moveLowestItemPersonStates()
		} else {
			moveMainItemState()
		}
	}

	const moveLowestItemPersonStates = () => {
		const itemWithOverriddenProp: Item = makeItemWithOverriddenPropIfNeeded(item, 'persons')
		const itemPersonsWithLowestState: ItemPerson[] = itemWithOverriddenProp.persons.filter(ip => ip.state === lowestItemState)
		const updatedItemPersons: ItemPerson[] = itemWithOverriddenProp.persons.map(ip => {
			const isPersonInLowestState: boolean = itemPersonsWithLowestState.some(lowestIP => lowestIP.person.id === ip.person.id)
			if (isPersonInLowestState) {
				return makeItemPersonWithNextState(ip)
			}
			return ip
		})
		const updatedItem: Item = {
			...itemWithOverriddenProp,
			persons: updatedItemPersons
		}
		setItem(updatedItem)
	}

	const moveMainItemState = () => {
		if (isLastItemState(item.state)) return

		const itemWithOverriddenProp: Item = makeItemWithOverriddenPropIfNeeded(item, 'state')
		const nextState: ItemState = getNextItemState(itemWithOverriddenProp.state)
		const updatedItem: Item = {
			...itemWithOverriddenProp,
			state: nextState,
		}
		setItem(updatedItem)
	}

	const setWholeState = (state: ItemState) => {
		if (hasPersons) {
			setItemPersonStates(state)
		} else {
			setMainItemState(state)
		}
	}

	const setItemPersonStates = (state: ItemState) => {
		const itemWithOverriddenProp: Item = makeItemWithOverriddenPropIfNeeded(item, 'persons')
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
		setItem(updatedItem)
	}

	const setMainItemState = (state: ItemState) => {
		const itemWithOverriddenProp: Item = makeItemWithOverriddenPropIfNeeded(item, 'state')
		const updatedItem: Item = {
			...itemWithOverriddenProp,
			state
		}
		setItem(updatedItem)
	}

	return {
		moveWholeState,
		setWholeState,
	}
}

export default useItemState
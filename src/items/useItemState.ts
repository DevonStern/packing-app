import { List } from "../lists/listModels"
import { getItemPersonWithNextState, getNextItemState, isLastItemState } from "../utils/itemStateUtils"
import { Item, ItemPerson, ItemState } from "./itemModels"
import useItemInfo from "./useItemInfo"
import useListItems from "./useListItems"

const useItemState = (list: List, item: Item) => {
	const { setItem } = useListItems(list)
	const { hasPersons, lowestItemState } = useItemInfo(item)

	const moveWholeState = () => {
		if (hasPersons) {
			moveLowestItemPersonStates()
		} else {
			moveMainItemState()
		}
	}

	const moveLowestItemPersonStates = () => {
		const itemPersonsWithLowestState: ItemPerson[] = item.persons.filter(ip => ip.state === lowestItemState)
		const updatedItemPersons: ItemPerson[] = item.persons.map(ip => {
			const isPersonInLowestState: boolean = itemPersonsWithLowestState.some(lowestIP => lowestIP.person.id === ip.person.id)
			if (isPersonInLowestState) {
				return getItemPersonWithNextState(ip)
			}
			return ip
		})
		const updatedItem: Item = {
			...item,
			persons: updatedItemPersons
		}
		setItem(item, updatedItem)
	}

	const moveMainItemState = () => {
		if (isLastItemState(item.state)) return

		const nextState: ItemState = getNextItemState(item.state)
		const updatedItem: Item = {
			...item,
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
		const updatedItemPersons: ItemPerson[] = item.persons.map(ip => {
			return {
				...ip,
				state
			}
		})
		const updatedItem: Item = {
			...item,
			persons: updatedItemPersons
		}
		setItem(item, updatedItem)
	}

	const setMainItemState = (state: ItemState) => {
		const updatedItem: Item = {
			...item,
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
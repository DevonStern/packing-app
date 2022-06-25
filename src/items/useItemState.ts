import { useSetRecoilState } from "recoil"
import { List } from "../lists/listModel"
import { getItemPersonWithNextState, getNextItemState, isLastItemState } from "../utils/itemStateUtils"
import { Item, ItemPerson, itemState, ItemState } from "./itemModel"
import useItemInfo from "./useItemInfo"

const useItemState = (list: List, item: Item) => {
	const setItem = useSetRecoilState(itemState({
		listId: list.id,
		itemId: item.id,
		toJSON: () => JSON.stringify({ listId: list.id, itemId: item.id }),
	}))
	
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
		setItem(updatedItem)
	}

	const moveMainItemState = () => {
		if (isLastItemState(item.state)) return

		const nextState: ItemState = getNextItemState(item.state)
		const updatedItem: Item = {
			...item,
			state: nextState,
		}
		setItem(updatedItem)
	}

	return {
		moveWholeState,
	}
}

export default useItemState
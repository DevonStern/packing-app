import { IonItem, IonLabel, IonList } from "@ionic/react"
import { useRecoilValue, useSetRecoilState } from "recoil"
import useItemInfo from "./useItemInfo"
import { List } from "../lists/listModel"
import { personsState } from "../persons/personModel"
import PersonSelect from "../persons/PersonSelect"
import { getItemPersonWithNextState, getNextItemState, isLastItemState } from "../utils/itemStateUtils"
import { Item, ItemPerson, itemState, ItemState } from "./itemModel"
import ItemPersonRow from "./ItemPersonRow"
import MoveItemStateButton from "./MoveItemStateButton"

interface ItemViewProps {
	list: List
	item: Item
}

const ItemView: React.FC<ItemViewProps> = ({ list, item }) => {
	const setItem = useSetRecoilState(itemState({
		listId: list.id,
		itemId: item.id,
		toJSON: () => JSON.stringify({ listId: list.id, itemId: item.id }),
	}))
	const persons = useRecoilValue(personsState)

	const { hasPersons, lowestItemState, stateText } = useItemInfo(item)

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

	return (
		<>
			<IonList>
				{persons.length > 0 ? (
					<IonItem>
						<IonLabel>People</IonLabel>
						<PersonSelect list={list} selectedItems={[item]} />
					</IonItem>
				) : null}
				{hasPersons ? (
					<>
						<IonItem>
							<IonList style={{ width: '100%' }}>
								{item.persons.map((itemPerson) => (
									<ItemPersonRow
										key={itemPerson.person.id}
										list={list}
										item={item}
										itemPerson={itemPerson}
									/>
								))}
							</IonList>
						</IonItem>
						<IonItem>Overall: {stateText}</IonItem>
					</>
				) : (
					<IonItem>{stateText}</IonItem>
				)}
			</IonList>
			<MoveItemStateButton
				expand="block"
				state={lowestItemState}
				onClick={moveWholeState}
			/>
		</>
	)
}

export default ItemView
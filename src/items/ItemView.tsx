import { IonItem, IonLabel, IonList } from "@ionic/react"
import { useRecoilState, useRecoilValue } from "recoil"
import useItemInfo from "../hooks/useItemInfo"
import { personsState } from "../persons/PersonModel"
import PersonSelect from "../persons/PersonSelect"
import { getItemPersonWithNextState, getNextItemState, isLastItemState } from "../utils/utils"
import { currentItemState, Item, ItemPerson, ItemState } from "./ItemModel"
import ItemPersonRow from "./ItemPersonRow"
import MoveItemStateButton from "./MoveItemStateButton"

const ItemView: React.FC = () => {
	const [item, setItem] = useRecoilState(currentItemState)
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
						<PersonSelect />
					</IonItem>
				) : null}
				{hasPersons ? (
					<>
						<IonItem>
							<IonList style={{ width: '100%' }}>
								{item.persons.map((itemPerson) => (
									<ItemPersonRow
										key={itemPerson.person.id}
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
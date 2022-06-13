import { IonButton, IonItem, IonLabel, IonList } from "@ionic/react"
import { useRecoilState } from "recoil"
import PersonSelect from "../persons/PersonSelect"
import { getNextItemState } from "../utils/utils"
import { currentItemState, Item, ItemState } from "./ItemModel"

const ItemView: React.FC = () => {
	const [item, setItem] = useRecoilState(currentItemState)

	//All keys and values are included in the array for reverse lookup, so divide by 2
	const numStates: number = Object.values(ItemState).length / 2
	const isLastState: boolean = item.state.valueOf() === numStates - 1
	const nextState: ItemState = getNextItemState(item.state)

	const moveState = () => {
		if (isLastState) return

		const updatedItem: Item = {
			...item,
			state: nextState,
		}
		setItem(updatedItem)
	}

	return (
		<>
			<IonList>
				<IonItem>
					<IonLabel>People</IonLabel>
					<PersonSelect />
				</IonItem>
				<IonItem>
					<IonLabel>State: {ItemState[item.state]}</IonLabel>
				</IonItem>
			</IonList>
			<IonButton expand="block" disabled={isLastState} onClick={moveState}>
				{!isLastState ? ItemState[nextState] : 'Ready'}
			</IonButton>
		</>
	)
}

export default ItemView
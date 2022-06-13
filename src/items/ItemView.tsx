import { IonButton, IonItem, IonLabel } from "@ionic/react"
import { useRecoilState, useSetRecoilState } from "recoil"
import { getNextItemState } from "../utils/utils"
import { currentItemIdState, currentItemState, Item, ItemState } from "./ItemModel"

const ItemView: React.FC = () => {
	const setCurrentItemId = useSetRecoilState(currentItemIdState)
	const [currentItem, setCurrentItem] = useRecoilState(currentItemState)
	
	//All keys and values are included in the array for reverse lookup, so divide by 2
	const numStates: number = Object.values(ItemState).length / 2
	const isLastState: boolean = currentItem.state.valueOf() === numStates - 1
	const nextState: ItemState = getNextItemState(currentItem.state)

	const moveState = () => {
		const updatedItem: Item = {
			...currentItem,
			state: nextState,
		}
		setCurrentItem(updatedItem)
	}

	return (
		<>
			<IonItem>
				<IonLabel>State: {ItemState[currentItem.state]}</IonLabel>
			</IonItem>
			<IonButton expand="block" disabled={isLastState} onClick={moveState}>
				{!isLastState ? ItemState[nextState] : 'Ready'}
			</IonButton>
		</>
	)
}

export default ItemView
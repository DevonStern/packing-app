import { IonButton, IonContent, IonHeader, IonItem, IonLabel, IonPage, IonTitle, IonToolbar } from "@ionic/react"
import { useRecoilState } from "recoil"
import { getNextItemState } from "../utils/utils"
import { currentItemIdState, currentItemState, Item, ItemState } from "./ItemModel"

const ItemPage: React.FC = () => {
	const [currentItemId, setCurrentItemId] = useRecoilState(currentItemIdState)
	const [currentItem, setCurrentItem] = useRecoilState(currentItemState(currentItemId))
	
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
		<IonPage>
			<IonHeader>
				<IonToolbar>
					<IonTitle>{currentItem.name}</IonTitle>
				</IonToolbar>
			</IonHeader>
			<IonContent fullscreen>
				<IonHeader collapse="condense">
					<IonToolbar>
						<IonTitle size="large">{currentItem.name}</IonTitle>
					</IonToolbar>
				</IonHeader>
				<IonItem>
					<IonLabel>State: {ItemState[currentItem.state]}</IonLabel>
				</IonItem>
				<IonButton expand="block" disabled={isLastState} onClick={moveState}>
					{!isLastState ? ItemState[nextState] : ItemState[currentItem.state]}
				</IonButton>
				<IonButton onClick={() => setCurrentItemId(undefined)}>Back</IonButton>
			</IonContent>
		</IonPage>
	)
}

export default ItemPage
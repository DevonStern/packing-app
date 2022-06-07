import { IonButton, IonContent, IonHeader, IonInput, IonItem, IonLabel, IonPage, IonTitle, IonToolbar } from "@ionic/react"
import { useRef, useState } from "react"
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil"
import useInputFocus from "../hooks/useInputFocus"
import { getNextItemState } from "../utils/utils"
import { currentItemIdState, currentItemState, Item, ItemState } from "./ItemModel"

const ItemPage: React.FC = () => {
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
		<IonPage>
			<IonHeader>
				<ItemName isTitleLarge={false} />
			</IonHeader>
			<IonContent fullscreen>
				<IonHeader collapse="condense">
					<ItemName isTitleLarge={true} />
				</IonHeader>
				<IonItem>
					<IonLabel>State: {ItemState[currentItem.state]}</IonLabel>
				</IonItem>
				<IonButton expand="block" disabled={isLastState} onClick={moveState}>
					{!isLastState ? ItemState[nextState] : 'Ready'}
				</IonButton>
				<IonButton onClick={() => setCurrentItemId(undefined)}>Back</IonButton>
			</IonContent>
		</IonPage>
	)
}

export default ItemPage



interface ItemNameProps {
	isTitleLarge: boolean
}

const ItemName: React.FC<ItemNameProps> = ({ isTitleLarge }) => {
	const currentItem = useRecoilValue(currentItemState)

	const [isEditingName, setIsEditingName] = useState<boolean>(false)

	return (
		<>
			{!isEditingName ?
				<IonToolbar onClick={() => setIsEditingName(true)}>
					<IonTitle size={isTitleLarge ? 'large' : undefined}>{currentItem.name}</IonTitle>
				</IonToolbar>
				:
				<IonToolbar>
					<ItemNameInput setIsEditingName={setIsEditingName} />
				</IonToolbar>
			}
		</>
	)
}



interface ItemNameInputProps {
	setIsEditingName: React.Dispatch<React.SetStateAction<boolean>>
}

const ItemNameInput: React.FC<ItemNameInputProps> = ({ setIsEditingName }) => {
	const [currentItem, setCurrentItem] = useRecoilState(currentItemState)

	const [name, setName] = useState<string>(currentItem.name)

	const inputRef = useRef<HTMLIonInputElement | null>(null)
	useInputFocus(inputRef)

	const submitName = () => {
		if (!name.trim()) {
			setName(currentItem.name)
		} else {
			const updatedItem: Item = {
				...currentItem,
				name: name.trim(),
			}
			setCurrentItem(updatedItem)
		}
		setIsEditingName(false)
	}

	return (
		<IonInput
			ref={inputRef}
			value={name}
			onIonChange={event => setName(event.detail.value ?? '')}
			onIonBlur={submitName}
		/>
	)
}
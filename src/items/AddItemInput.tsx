import { IonButton, IonInput, IonItem, IonLabel, IonModal } from "@ionic/react"
import { useState } from "react"
import { useRecoilState } from "recoil"
import { Item, itemsState, ItemState, makeItem } from "./ItemModel"

interface AddItemInputProps {
	isOpen: boolean
	setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const AddItemInput: React.FC<AddItemInputProps> = ({ isOpen, setIsOpen }) => {
	const [items, setItems] = useRecoilState(itemsState)

	const [name, setName] = useState<string>('')

	const changeHandler = (value: string | null | undefined) => {
		setName(value ?? '')
	}

	const addItem = () => {
		if (!name.trim()) return

		const newItem: Item = makeItem(name.trim())
		const newItems: Item[] = [
			...items,
			newItem
		]
		setItems(newItems)
		setName('')
	}

	return (
		<IonModal
			isOpen={isOpen}
		>
			<IonItem>
				<IonLabel>Item:</IonLabel>
				<IonInput
					value={name}
					placeholder="Banjo"
					onIonChange={event => changeHandler(event.detail.value)}
				/>
			</IonItem>
			<IonButton expand="block" onClick={addItem}>Add</IonButton>
			<IonButton onClick={() => setIsOpen(false)}>Close</IonButton>
		</IonModal>
	)
}

export default AddItemInput
import { IonButton, IonInput, IonModal } from "@ionic/react"
import { useState } from "react"
import { useRecoilState } from "recoil"
import { Item, itemsState } from "./ItemModel"

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

		const newItem: Item = {
			id: name, //FIXME: use uuid
			name: name.trim()
		}
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
			<div>
				<IonInput
					value={name}
					placeholder="Item"
					onIonChange={event => changeHandler(event.detail.value)}
				/>
			</div>
			<IonButton expand="block" onClick={addItem}>Add</IonButton>
			<IonButton expand="block" onClick={() => setIsOpen(false)}>Close</IonButton>
		</IonModal>
	)
}

export default AddItemInput
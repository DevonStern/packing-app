import { IonButton, IonInput, IonItem, IonLabel } from "@ionic/react"
import { useState } from "react"

interface AddObjectInputProps {
	add: (name: string) => void
	label: string
	placeholder: string
}

const AddObjectInput: React.FC<AddObjectInputProps> = ({ add: addObject, label, placeholder }) => {
	const [name, setName] = useState<string>('')

	const changeHandler = (value: string | null | undefined) => {
		setName(value ?? '')
	}
	
	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		add()
	}

	const add = () => {
		if (!name.trim()) return

		addObject(name.trim())
		setName('')
	}

	return (
		<form onSubmit={handleSubmit}>
			<IonItem>
				<IonLabel>{label}:</IonLabel>
				<IonInput
					value={name}
					placeholder={placeholder}
					onIonChange={event => changeHandler(event.detail.value)}
				/>
			</IonItem>
			<IonButton expand="block" onClick={add}>Add</IonButton>
		</form>
	)
}

export default AddObjectInput
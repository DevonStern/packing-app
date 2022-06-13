import { IonButton, IonInput, IonItem, IonLabel, IonModal } from "@ionic/react"
import { useState } from "react"
import { useRecoilState } from "recoil"
import { makePerson, Person, personsState } from "./PersonModel"

interface AddPersonInputProps {
	isOpen: boolean
	setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const AddPersonInput: React.FC<AddPersonInputProps> = ({ isOpen, setIsOpen }) => {
	const [persons, setPersons] = useRecoilState(personsState)

	const [name, setName] = useState<string>('')

	const changeHandler = (value: string | null | undefined) => {
		setName(value ?? '')
	}

	const addPerson = () => {
		if (!name.trim()) return

		const newPerson: Person = makePerson(name.trim())
		const newPersons: Person[] = [
			...persons,
			newPerson
		]
		setPersons(newPersons)
		setName('')
	}

	return (
		<IonModal
			isOpen={isOpen}
		>
			<IonItem>
				<IonLabel>Person:</IonLabel>
				<IonInput
					value={name}
					placeholder="Megan"
					onIonChange={event => changeHandler(event.detail.value)}
				/>
			</IonItem>
			<IonButton expand="block" onClick={addPerson}>Add</IonButton>
			<IonButton onClick={() => setIsOpen(false)}>Close</IonButton>
		</IonModal>
	)
}

export default AddPersonInput
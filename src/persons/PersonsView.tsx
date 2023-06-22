import { IonIcon, IonItem, IonItemOption, IonItemOptions, IonItemSliding, IonList } from "@ionic/react"
import { useState } from "react"
import { useRecoilState } from "recoil"
import Fab from "../general/Fab"
import Modal from "../general/Modal"
import AddPersonInput from "./AddPersonInput"
import { personsState } from "./personModel"
import { trash } from "ionicons/icons"

const PersonsView: React.FC = () => {
	const [persons, setPersons] = useRecoilState(personsState)
	
	const [isAddInputOpen, setIsAddInputOpen] = useState<boolean>(false)

	const deletePerson = (id: string) => {
		setPersons((oldPersons) => {
			const index = oldPersons.findIndex(p => p.id === id)
			if (index === -1) {
				throw new Error(`Could not find person to delete: id = ${id}`)
			}
			return [
				...oldPersons.slice(0, index),
				...oldPersons.slice(index + 1)
					.map(p => ({ ...p, sortOrder: p.sortOrder - 1 })), // Adjust sort orders down
			]
		})
	}

	return (
		<>
			<IonList>
				{persons.map(person => {
					return (
					<IonItemSliding key={person.id}>
						<IonItem>{person.name}</IonItem>
						<IonItemOptions side="start">
							<IonItemOption color="danger" onClick={() => deletePerson(person.id)}>
								<IonIcon slot="icon-only" icon={trash} size="large" />
							</IonItemOption>
						</IonItemOptions>
					</IonItemSliding>
					)
				})}
			</IonList>
			<Fab onClick={() => setIsAddInputOpen(true)} />
			<Modal isOpen={isAddInputOpen} setIsOpen={setIsAddInputOpen}>
				<AddPersonInput />
			</Modal>
		</>
	)
}

export default PersonsView
import { IonItem, IonList } from "@ionic/react"
import { useState } from "react"
import { useRecoilValue } from "recoil"
import Fab from "../general/Fab"
import Modal from "../general/Modal"
import AddPersonInput from "./AddPersonInput"
import { personsState } from "./personModel"

const PersonsView: React.FC = () => {
	const persons = useRecoilValue(personsState)

	const [isAddInputOpen, setIsAddInputOpen] = useState<boolean>(false)

	return (
		<>
			<IonList>
				{persons.map(person => {
					return (
						<IonItem key={person.id}>{person.name}</IonItem>
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
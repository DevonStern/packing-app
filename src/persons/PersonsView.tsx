import { IonFab, IonFabButton, IonIcon, IonItem, IonList } from "@ionic/react"
import { add } from "ionicons/icons"
import { useState } from "react"
import { useRecoilState } from "recoil"
import Modal from "../general/Modal"
import AddPersonInput from "./AddPersonInput"
import { personsState } from "./personModel"

const PersonsView: React.FC = () => {
	const [persons, setPersons] = useRecoilState(personsState)
	
	const [isAddInputOpen, setIsAddInputOpen] = useState<boolean>(false)

	return (
		<>
			<IonList>
				{persons.map(person => {
					return <IonItem key={person.id}>{person.name}</IonItem>
				})}
			</IonList>
			<IonFab horizontal="center" vertical="bottom" style={{ paddingBottom: '60px' }}>
				<IonFabButton onClick={() => setIsAddInputOpen(true)}>
					<IonIcon icon={add} size="large" />
				</IonFabButton>
			</IonFab>
			<Modal isOpen={isAddInputOpen} setIsOpen={setIsAddInputOpen}>
				<AddPersonInput />
			</Modal>
		</>
	)
}

export default PersonsView
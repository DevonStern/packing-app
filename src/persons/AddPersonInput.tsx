import { useRecoilState } from "recoil"
import AddObjectInput from "../general/AddObjectInput"
import { makePerson, Person, personsState } from "./personModel"

const AddPersonInput: React.FC = () => {
	const [persons, setPersons] = useRecoilState(personsState)

	const addPerson = (name: string) => {
		const newPerson: Person = makePerson(name)
		const newPersons: Person[] = [
			...persons,
			newPerson
		]
		setPersons(newPersons)
	}

	return (
		<AddObjectInput
			add={addPerson}
			label="Person"
			placeholder="Megan"
		/>
	)
}

export default AddPersonInput
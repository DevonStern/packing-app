import { useSetRecoilState } from "recoil"
import AddObjectInput from "../general/AddObjectInput"
import { makePerson, personsState } from "./personModel"

const AddPersonInput: React.FC = () => {
	const setPersons = useSetRecoilState(personsState)

	const addPerson = (name: string) => {
		setPersons((oldPersons) => [
			...oldPersons,
			makePerson(name, oldPersons.length),
		])
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
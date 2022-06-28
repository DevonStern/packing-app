import AddObjectInput from "../general/AddObjectInput"
import useLists from "./useLists"

const AddListInput: React.FC = () => {
	const { addList } = useLists()

	return (
		<AddObjectInput
			add={addList}
			label="Trip"
			placeholder="Italy"
		/>
	)
}

export default AddListInput
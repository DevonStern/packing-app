import AddObjectInput from "../general/AddObjectInput"
import { List } from "../lists/listModel"
import useItems from "./useItems"

interface AddItemInputProps {
	list: List
}

const AddItemInput: React.FC<AddItemInputProps> = ({ list }) => {
	const { createItem } = useItems(list)

	return (
		<AddObjectInput
			add={createItem}
			label="Item"
			placeholder="Banjo"
		/>
	)
}

export default AddItemInput
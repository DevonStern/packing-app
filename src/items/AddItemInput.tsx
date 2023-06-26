import AddObjectInput from "../general/AddObjectInput"
import { List } from "../lists/listModels"
import useListItems from "./useListItems"

interface AddItemInputProps {
	list: List
}

const AddItemInput: React.FC<AddItemInputProps> = ({ list }) => {
	const { createItem } = useListItems(list.id)

	return (
		<AddObjectInput
			add={createItem}
			label="Item"
			placeholder="Banjo"
		/>
	)
}

export default AddItemInput
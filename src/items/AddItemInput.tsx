import { useRecoilState } from "recoil"
import AddObjectInput from "../general/AddObjectInput"
import { List } from "../lists/ListModel"
import { Item, itemsState, makeItem } from "./ItemModel"

interface AddItemInputProps {
	list: List
}

const AddItemInput: React.FC<AddItemInputProps> = ({ list }) => {
	const [items, setItems] = useRecoilState(itemsState(list.id))

	const addItem = (name: string) => {
		const newItem: Item = makeItem(name)
		const newItems: Item[] = [
			...items,
			newItem
		]
		setItems(newItems)
	}

	return (
		<AddObjectInput
			add={addItem}
			label="Item"
			placeholder="Banjo"
		/>
	)
}

export default AddItemInput
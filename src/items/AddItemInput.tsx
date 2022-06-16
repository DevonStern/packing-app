import { useRecoilState } from "recoil"
import AddObjectInput from "../general/AddObjectInput"
import { List } from "../lists/ListModel"
import { Item, itemsState, makeItem } from "./ItemModel"

interface AddItemInputProps {
	list: List
}

const AddItemInput: React.FC<AddItemInputProps> = ({ list }) => {
	const [blah, setItems] = useRecoilState(itemsState)

	const addItem = (name: string) => {
		const newItem: Item = makeItem(name)
		const newItems: Item[] = [
			...list.items,
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
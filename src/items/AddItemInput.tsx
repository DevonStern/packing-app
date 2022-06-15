import { useRecoilState } from "recoil"
import AddObjectInput from "../general/AddObjectInput"
import { Item, itemsState, makeItem } from "./ItemModel"

const AddItemInput: React.FC = () => {
	const [items, setItems] = useRecoilState(itemsState)

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
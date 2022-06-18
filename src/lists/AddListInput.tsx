import { useRecoilState } from "recoil"
import AddObjectInput from "../general/AddObjectInput"
import { List, listsState, makeList } from "./listModel"

const AddListInput: React.FC = () => {
	const [lists, setLists] = useRecoilState(listsState)

	const addList = (name: string) => {
		const newList: List = makeList(name)
		const newLists: List[] = [
			...lists,
			newList
		]
		setLists(newLists)
	}

	return (
		<AddObjectInput
			add={addList}
			label="Trip"
			placeholder="Italy"
		/>
	)
}

export default AddListInput
import { useRecoilState } from "recoil"
import { List, listsState, makeList } from "./listModels"

const useLists = () => {
	const [lists, setLists] = useRecoilState(listsState)

	const addList = (name: string) => {
		const newList: List = makeList(name)
		const newLists: List[] = [
			...lists,
			newList
		]
		setLists(newLists)
	}

	const deleteList = (listId: string) => {
		const newLists: List[] = lists.filter(l => l.id !== listId)
		setLists(newLists)
	}

	return {
		addList,
		deleteList,
	}
}

export default useLists
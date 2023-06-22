import { useSetRecoilState } from "recoil"
import { listsState, makeList } from "./listModels"

const useLists = () => {
	const setLists = useSetRecoilState(listsState)

	const addList = (name: string) => {
		setLists((oldLists) => [
			...oldLists,
			makeList(name, oldLists.length)
		])
	}

	const deleteList = (listId: string) => {
		setLists((oldLists) => {
			const index = oldLists.findIndex(l => l.id === listId)
			if (index === -1) {
				throw new Error(`Could not find list to delete: id = ${listId}`)
			}
			return [
				...oldLists.slice(0, index),
				...oldLists.slice(index + 1)
					.map(l => ({ ...l, sortOrder: l.sortOrder - 1 })), // Adjust sort orders down
			]
		})
	}

	return {
		addList,
		deleteList,
	}
}

export default useLists
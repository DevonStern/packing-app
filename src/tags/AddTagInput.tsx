import { useSetRecoilState } from "recoil"
import AddObjectInput from "../general/AddObjectInput"
import { makeTag, tagsState } from "./tagModel"

const AddTagInput: React.FC = () => {
	const setTags = useSetRecoilState(tagsState)

	const addTag = (name: string) => {
		setTags(oldTags => [
			...oldTags,
			makeTag(name, oldTags.length),
		])
	}

	return (
		<AddObjectInput
			add={addTag}
			label="Tag"
			placeholder="Clothes"
		/>
	)
}

export default AddTagInput
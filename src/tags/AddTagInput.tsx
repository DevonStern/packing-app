import { useSetRecoilState } from "recoil"
import AddObjectInput from "../general/AddObjectInput"
import { makeTag, Tag, tagsState } from "./tagModel"

const AddTagInput: React.FC = () => {
	const setTags = useSetRecoilState(tagsState)

	const addTag = (name: string) => {
		const newTag: Tag = makeTag(name)
		setTags(oldTags => [ ...oldTags, newTag ])
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
import { useRecoilState } from "recoil"
import AddObjectInput from "../general/AddObjectInput"
import { makeTag, Tag, tagsState } from "./tagModel"

const AddTagInput: React.FC = () => {
	const [tags, setTags] = useRecoilState(tagsState)

	const addTag = (name: string) => {
		const newTag: Tag = makeTag(name)
		const newTags: Tag[] = [
			...tags,
			newTag
		]
		setTags(newTags)
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
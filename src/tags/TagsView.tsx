import { IonItem, IonList } from "@ionic/react"
import { useState } from "react"
import { useRecoilState } from "recoil"
import Fab from "../general/Fab"
import Modal from "../general/Modal"
import AddTagInput from "./AddTagInput"
import { tagsState } from "./tagModel"

const TagsView: React.FC = () => {
	const [tags, setTags] = useRecoilState(tagsState)

	const [isAddInputOpen, setIsAddInputOpen] = useState<boolean>(false)

	return (
		<>
			<IonList>
				{tags.map(tag => {
					return <IonItem key={tag.id}>{tag.name}</IonItem>
				})}
			</IonList>
			<Fab onClick={() => setIsAddInputOpen(true)} />
			<Modal isOpen={isAddInputOpen} setIsOpen={setIsAddInputOpen}>
				<AddTagInput />
			</Modal>
		</>
	)
}

export default TagsView
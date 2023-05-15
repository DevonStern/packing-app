import { IonIcon, IonItem, IonItemOption, IonItemOptions, IonItemSliding, IonList } from "@ionic/react"
import { useState } from "react"
import { useRecoilState } from "recoil"
import Fab from "../general/Fab"
import Modal from "../general/Modal"
import AddTagInput from "./AddTagInput"
import { tagsState } from "./tagModel"
import { trash } from "ionicons/icons"

const TagsView: React.FC = () => {
	const [tags, setTags] = useRecoilState(tagsState)

	const [isAddInputOpen, setIsAddInputOpen] = useState<boolean>(false)

	const deleteTag = (id: string) => {
		setTags((oldTags) => {
			const index = oldTags.findIndex(t => t.id === id)
			if (index === -1) {
				throw new Error(`Could not find tag to delete: id = ${id}`)
			}
			return [
				...oldTags.slice(0, index),
				...oldTags.slice(index + 1)
					.map(t => ({ ...t, sortOrder: t.sortOrder - 1 })), // Adjust sort orders down
			]
		})
	}

	return (
		<>
			<IonList>
				{tags.map(tag => {
					return (
						<IonItemSliding key={tag.id}>
							<IonItem>{tag.name}</IonItem>
							<IonItemOptions side="start">
								<IonItemOption color="danger" onClick={() => deleteTag(tag.id)}>
									<IonIcon slot="icon-only" icon={trash} size="large" />
								</IonItemOption>
							</IonItemOptions>
						</IonItemSliding>
					)
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
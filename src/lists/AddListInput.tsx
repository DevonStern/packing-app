import { IonButton, IonInput, IonItem, IonLabel, IonModal } from "@ionic/react"
import { useState } from "react"
import { useRecoilState } from "recoil"
import { List, listsState, makeList } from "./ListModel"

const AddListInput: React.FC = () => {
	const [lists, setLists] = useRecoilState(listsState)

	const [name, setName] = useState<string>('')

	const changeHandler = (value: string | null | undefined) => {
		setName(value ?? '')
	}

	const addList = () => {
		if (!name.trim()) return

		const newList: List = makeList(name.trim())
		const newLists: List[] = [
			...lists,
			newList
		]
		setLists(newLists)
		setName('')
	}

	return (
		<>
			<IonItem>
				<IonLabel>Trip:</IonLabel>
				<IonInput
					value={name}
					placeholder="Italy"
					onIonChange={event => changeHandler(event.detail.value)}
				/>
			</IonItem>
			<IonButton expand="block" onClick={addList}>Add</IonButton>
		</>
	)
}

export default AddListInput
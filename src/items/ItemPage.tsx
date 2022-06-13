import { IonBackButton, IonButtons, IonContent, IonHeader, IonInput, IonPage, IonTitle, IonToolbar } from "@ionic/react"
import { useRef, useState } from "react"
import { useRecoilState, useRecoilValue } from "recoil"
import useInputFocus from "../hooks/useInputFocus"
import { currentItemState, Item } from "./ItemModel"
import ItemView from "./ItemView"

const ItemPage: React.FC = () => {
	return (
		<IonPage>
			<Header isMain={true} />
			<IonContent fullscreen>
				<Header isMain={false} />
				<ItemView />
			</IonContent>
		</IonPage>
	)
}

export default ItemPage



interface HeaderProps {
	isMain: boolean
}

const Header: React.FC<HeaderProps> = ({ isMain }) => {
	const currentItem = useRecoilValue(currentItemState)

	const [isEditingName, setIsEditingName] = useState<boolean>(false)

	return (
		<IonHeader collapse={isMain ? undefined : 'condense'}>
			<IonToolbar>
				<IonButtons slot="start">
					<IonBackButton />
				</IonButtons>
				{!isEditingName ?
					<IonTitle size={isMain ? undefined : 'large'} onClick={() => setIsEditingName(true)}>
						{currentItem.name}
					</IonTitle>
					:
					<ItemNameInput setIsEditingName={setIsEditingName} />
				}
			</IonToolbar>
		</IonHeader>
	)
}



interface ItemNameInputProps {
	setIsEditingName: React.Dispatch<React.SetStateAction<boolean>>
}

const ItemNameInput: React.FC<ItemNameInputProps> = ({ setIsEditingName }) => {
	const [currentItem, setCurrentItem] = useRecoilState(currentItemState)

	const [name, setName] = useState<string>(currentItem.name)

	const inputRef = useRef<HTMLIonInputElement | null>(null)
	useInputFocus(inputRef)

	const submitName = () => {
		if (!name.trim()) {
			setName(currentItem.name)
		} else {
			const updatedItem: Item = {
				...currentItem,
				name: name.trim(),
			}
			setCurrentItem(updatedItem)
		}
		setIsEditingName(false)
	}

	return (
		<IonInput
			ref={inputRef}
			value={name}
			onIonChange={event => setName(event.detail.value ?? '')}
			onIonBlur={submitName}
		/>
	)
}
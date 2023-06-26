import { IonBackButton, IonButtons, IonContent, IonHeader, IonInput, IonPage, IonTitle, IonToolbar } from "@ionic/react"
import { useRef, useState } from "react"
import { RouteComponentProps } from "react-router-dom"
import { useRecoilValue } from "recoil"
import useInputFocus from "../general/useInputFocus"
import { List, listsState } from "../lists/listModels"
import { Item } from "./itemModels"
import ItemView from "./ItemView"
import useListItems from "./useListItems"

interface ItemPageProps extends RouteComponentProps<{
	listId: string
	itemId: string
}> {
}

const ItemPage: React.FC<ItemPageProps> = ({ match: { params: { listId, itemId } } }) => {
	const lists = useRecoilValue(listsState)

	const list: List | undefined = lists.find(l => l.id === listId)
	const item: Item | undefined = list?.items.find(i => i.id === itemId)
	if (!list || !item) {
		console.error(`Invalid listId or itemId param in route: listId = ${listId}, itemId = ${itemId}`)
		return <>Error</>
	}

	return (
		<IonPage>
			<Header list={list} item={item} isMain={true} />
			<IonContent fullscreen>
				<Header list={list} item={item} isMain={false} />
				<ItemView list={list} item={item} />
			</IonContent>
		</IonPage>
	)
}

export default ItemPage



interface HeaderProps {
	list: List
	item: Item
	isMain: boolean
}

const Header: React.FC<HeaderProps> = ({ list, item, isMain }) => {
	const [isEditingName, setIsEditingName] = useState<boolean>(false)

	return (
		<IonHeader collapse={isMain ? undefined : 'condense'}>
			<IonToolbar>
				<IonButtons slot="start">
					<IonBackButton />
				</IonButtons>
				{!isEditingName ?
					<IonTitle
						size={isMain ? undefined : 'large'}
						onClick={() => setIsEditingName(true)}
					>
						{item.name}
					</IonTitle>
					:
					<ItemNameInput
						list={list}
						item={item}
						setIsEditingName={setIsEditingName}
					/>
				}
			</IonToolbar>
		</IonHeader>
	)
}



interface ItemNameInputProps {
	list: List
	item: Item
	setIsEditingName: React.Dispatch<React.SetStateAction<boolean>>
}

const ItemNameInput: React.FC<ItemNameInputProps> = ({ list, item, setIsEditingName }) => {
	const [name, setName] = useState<string>(item.name)

	const { updateItemName } = useListItems(list.id)
	const inputRef = useRef<HTMLIonInputElement | null>(null)
	useInputFocus(inputRef)

	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		submitName()
	}

	const submitName = () => {
		if (!name.trim()) {
			setName(item.name)
		} else {
			updateItemName(item, name)
		}
		setIsEditingName(false)
	}

	return (
		<form onSubmit={handleSubmit}>
			<IonInput
				ref={inputRef}
				value={name}
				onIonChange={event => setName(event.detail.value ?? '')}
				onIonBlur={submitName}
			/>
		</form>
	)
}
import { IonBackButton, IonButtons, IonContent, IonHeader, IonInput, IonPage, IonTitle, IonToolbar } from "@ionic/react"
import { useRef, useState } from "react"
import { RouteComponentProps } from "react-router-dom"
import { useRecoilState, useRecoilValue } from "recoil"
import useInputFocus from "../hooks/useInputFocus"
import { List, listsState } from "../lists/ListModel"
import { Item, itemsState } from "./ItemModel"
import ItemView from "./ItemView"

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
	const [items, setItems] = useRecoilState(itemsState(list.id))
	const setItem = (updatedItem: Item) => {
		const updatedItems: Item[] = items.map(i => {
			if (i.id === updatedItem.id) {
				return updatedItem
			}
			return i
		})
		setItems(updatedItems)
	}

	const [name, setName] = useState<string>(item.name)

	const inputRef = useRef<HTMLIonInputElement | null>(null)
	useInputFocus(inputRef)

	const submitName = () => {
		if (!name.trim()) {
			setName(item.name)
		} else {
			const updatedItem: Item = {
				...item,
				name: name.trim(),
			}
			setItem(updatedItem)
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
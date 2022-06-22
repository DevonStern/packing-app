import { IonSelect, IonSelectOption } from "@ionic/react"
import { useEffect, useRef, useState } from "react"
import { useRecoilValue, useSetRecoilState } from "recoil"
import { DEFAULT_ITEM_STATE, Item, ItemPerson, itemState, ItemState } from "../items/itemModel"
import { List } from "../lists/listModel"
import { Person, personsState } from "./personModel"

interface PersonSelectProps {
	list: List
	item: Item
	openSelect?: boolean
}

const PersonSelect: React.FC<PersonSelectProps> = ({ list, item, openSelect }) => {
	const setItem = useSetRecoilState(itemState({
		listId: list.id,
		itemId: item.id,
		toJSON: () => JSON.stringify({ listId: list.id, itemId: item.id }),
	}))
	const persons = useRecoilValue(personsState)

	const [ids, setIds] = useState<string[]>(item.persons.map(ip => ip.person.id))

	const selectRef = useRef<HTMLIonSelectElement | null>(null)

	useEffect(() => {
		if (openSelect) {
			selectRef.current?.open()
		}
	}, [openSelect])

	useEffect(() => {
		const doIdsMatch: boolean = JSON.stringify(ids) === JSON.stringify(item.persons.map(ip => ip.person.id))
		if (!doIdsMatch) {
			updateItemPersons()
		}
	}, [ids])

	const updateItemPersons = () => {
		const updatedPersons: Person[] = persons.filter(p => ids.some(id => id === p.id))
		const updatedItemPersons: ItemPerson[] = updatedPersons.map(person => {
			const currentItemPerson: ItemPerson | undefined = item.persons.find(ip => ip.person.id === person.id)
			const state: ItemState = currentItemPerson?.state ?? DEFAULT_ITEM_STATE
			const updatedItemPerson: ItemPerson = {
				person,
				state,
			}
			return updatedItemPerson
		})
		const updatedItem: Item = {
			...item,
			persons: updatedItemPersons
		}
		setItem(updatedItem)
	}

	return (
		<IonSelect
			ref={selectRef}
			multiple
			value={ids}
			onIonChange={event => setIds(event.detail.value)}
		>
			{persons.map(person => (
				<IonSelectOption key={person.id} value={person.id}>
					{person.name}
				</IonSelectOption>
			))}
		</IonSelect>
	)
}

export default PersonSelect
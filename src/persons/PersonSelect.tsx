import { IonSelect, IonSelectOption } from "@ionic/react"
import { useEffect, useState } from "react"
import { useRecoilState, useRecoilValue } from "recoil"
import { DEFAULT_ITEM_STATE, Item, ItemPerson, itemsState, ItemState } from "../items/ItemModel"
import { List } from "../lists/ListModel"
import { Person, personsState } from "./PersonModel"

interface PersonSelectProps {
	list: List
	item: Item
}

const PersonSelect: React.FC<PersonSelectProps> = ({ list, item }) => {
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
	const persons = useRecoilValue(personsState)

	const [ids, setIds] = useState<string[]>(item.persons.map(ip => ip.person.id))

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
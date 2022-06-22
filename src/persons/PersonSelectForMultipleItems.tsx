import { IonSelect, IonSelectOption, SelectChangeEventDetail } from "@ionic/react"
import { useEffect, useRef } from "react"
import { useRecoilValue, useRecoilState } from "recoil"
import { DEFAULT_ITEM_STATE, Item, ItemPerson, itemsState, ItemState } from "../items/itemModel"
import { List } from "../lists/listModel"
import { Person, personsState } from "./personModel"

interface PersonSelectForMultipleItemsProps {
	list: List
	selectedItems: Item[]
	openSelect?: boolean
}

const PersonSelectForMultipleItems: React.FC<PersonSelectForMultipleItemsProps> = ({ list, selectedItems, openSelect }) => {
	const [items, setItems] = useRecoilState(itemsState(list.id))
	const persons = useRecoilValue(personsState)

	const selectRef = useRef<HTMLIonSelectElement | null>(null)

	useEffect(() => {
		if (openSelect) {
			selectRef.current?.open()
		}
	}, [openSelect])

	const handleChange = (event: CustomEvent<SelectChangeEventDetail<string[]>>) => {
		const ids: string[] = event.detail.value
		if (ids.length > 0) {
			console.log(ids)
			updateItemPersonsOnSelectedItems(ids)
		}
	}

	const updateItemPersonsOnSelectedItems = (ids: string[]) => {
		console.log(items)
		const updatedPersons: Person[] = persons.filter(p => ids.some(id => id === p.id))
		const updatedItems: Item[] = items.map(item => {
			if (selectedItems.some(si => si.id === item.id)) {
				return getUpdatedItem(item, updatedPersons)
			}
			return item
		})
		setItems(updatedItems)
	}

	const getUpdatedItem = (item: Item, updatedPersons: Person[]): Item => {
		const updatedItemPersons: ItemPerson[] = updatedPersons.map(person => {
			const currentItemPerson: ItemPerson | undefined = item.persons.find(ip => ip.person.id === person.id)
			const state: ItemState = currentItemPerson?.state ?? DEFAULT_ITEM_STATE
			const updatedItemPerson: ItemPerson = {
				person,
				state,
			}
			return updatedItemPerson
		})
		return {
			...item,
			persons: updatedItemPersons
		}
	}

	return (
		<IonSelect
			ref={selectRef}
			multiple
			value={[]}
			onIonChange={handleChange}
		>
			{persons.map(person => (
				<IonSelectOption key={person.id} value={person.id}>
					{person.name}
				</IonSelectOption>
			))}
		</IonSelect>
	)
}

export default PersonSelectForMultipleItems
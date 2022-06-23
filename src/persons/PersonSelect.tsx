import { IonSelect, IonSelectOption, SelectChangeEventDetail } from "@ionic/react"
import { useEffect, useRef, useState } from "react"
import { useRecoilState, useRecoilValue } from "recoil"
import { DEFAULT_ITEM_STATE, Item, ItemPerson, itemsState, ItemState } from "../items/itemModel"
import { List } from "../lists/listModel"
import { Person, personsState } from "./personModel"

interface PersonSelectProps {
	list: List
	selectedItems: Item[]
	openSelect?: boolean
}

const PersonSelect: React.FC<PersonSelectProps> = ({ list, selectedItems, openSelect }) => {
	const [items, setItems] = useRecoilState(itemsState(list.id))
	const persons = useRecoilValue(personsState)

	const defaultValue: string[] = selectedItems.length === 1 ?
		selectedItems[0].persons.map(ip => ip.person.id) :
		[]
	const [ids, setIds] = useState<string[]>(defaultValue)
	const [wasCancelled, setWasCancelled] = useState<boolean>(false)

	const selectRef = useRef<HTMLIonSelectElement | null>(null)

	useEffect(() => {
		if (openSelect) {
			selectRef.current?.open()
		}
	}, [openSelect])

	const handleDismiss = () => {
		if (!wasCancelled) {
			updateItemPersonsOnSelectedItems()
			setWasCancelled(false)
		}
	}

	const handleChange = (event: CustomEvent<SelectChangeEventDetail<string[]>>) => {
		if (typeof event.detail.value === 'string') return

		const updatedIds: string[] = event.detail.value
		if (JSON.stringify(ids) === JSON.stringify(updatedIds)) return

		setIds(updatedIds)
	}

	const updateItemPersonsOnSelectedItems = () => {
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
			value={defaultValue}
			onIonChange={handleChange}
			onIonCancel={() => setWasCancelled(true)}
			onIonDismiss={handleDismiss}
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
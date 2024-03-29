import { IonSelect, IonSelectOption, SelectChangeEventDetail } from "@ionic/react"
import { useEffect, useRef, useState } from "react"
import { useRecoilValue } from "recoil"
import { Item } from "../items/itemModels"
import useListItems from "../items/useListItems"
import { List } from "../lists/listModels"
import { personsState } from "./personModel"

interface PersonSelectProps {
	list: List
	selectedItems: Item[]
	openSelect?: boolean
}

const PersonSelect: React.FC<PersonSelectProps> = ({ list, selectedItems, openSelect }) => {
	const persons = useRecoilValue(personsState)

	const defaultValue: string[] = selectedItems.length === 1 ?
		selectedItems[0].persons.map(ip => ip.person.id) :
		[]
	const [ids, setIds] = useState<string[]>(defaultValue)
	const [wasCancelled, setWasCancelled] = useState<boolean>(false)

	const { updateItemPersonsOnItems } = useListItems(list.id)
	const selectRef = useRef<HTMLIonSelectElement | null>(null)

	useEffect(() => {
		if (openSelect) {
			selectRef.current?.open()
		}
	}, [openSelect])

	const handleChange = (event: CustomEvent<SelectChangeEventDetail<string[]>>) => {
		if (typeof event.detail.value === 'string') return

		const updatedIds: string[] = event.detail.value
		if (JSON.stringify(ids) === JSON.stringify(updatedIds)) return

		setIds(updatedIds)
	}

	const handleDismiss = () => {
		if (!wasCancelled) {
			updateItemPersonsOnItems(selectedItems, ids)
			setWasCancelled(false)
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
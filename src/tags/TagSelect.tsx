import { IonSelect, IonSelectOption, SelectChangeEventDetail } from "@ionic/react"
import { useEffect, useRef, useState } from "react"
import { useRecoilValue } from "recoil"
import { Item } from "../items/itemModels"
import useListItems from "../items/useListItems"
import { List } from "../lists/listModels"
import { tagsState } from "./tagModel"

interface TagSelectProps {
	list: List
	selectedItems: Item[]
	openSelect?: boolean
}

const TagSelect: React.FC<TagSelectProps> = ({ list, selectedItems, openSelect }) => {
	const tags = useRecoilValue(tagsState)

	const defaultValue: string[] = selectedItems.length === 1 ?
		selectedItems[0].tags.map(tag => tag.id) :
		[]
	const [ids, setIds] = useState<string[]>(defaultValue)
	const [wasCancelled, setWasCancelled] = useState<boolean>(false)

	const { updateTagsOnItems } = useListItems(list)
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
			updateTagsOnItems(selectedItems, ids)
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
			{tags.map(tag => (
				<IonSelectOption key={tag.id} value={tag.id}>
					{tag.name}
				</IonSelectOption>
			))}
		</IonSelect>
	)
}

export default TagSelect
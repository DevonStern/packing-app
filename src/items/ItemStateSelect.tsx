import { IonSelect, IonSelectOption, SelectChangeEventDetail } from "@ionic/react"
import { useEffect, useRef, useState } from "react"
import { List } from "../lists/listModel"
import { getItemStateValues, getLowestItemState } from "../utils/itemStateUtils"
import { Item, ItemState } from "./itemModel"
import useItems from "./useItems"

interface ItemStateSelectProps {
	list: List
	selectedItems: Item[]
	openSelect: boolean
}

const ItemStateSelect: React.FC<ItemStateSelectProps> = ({ list, selectedItems, openSelect }) => {	
	const defaultValue: ItemState | undefined = selectedItems.length === 1 ?
		(selectedItems[0].persons.length > 0 ?
			getLowestItemState(selectedItems[0].persons) :
			selectedItems[0].state
		)
		:
		undefined
	const [selectedState, setSelectedState] = useState<ItemState | undefined>(defaultValue)
	const [wasCancelled, setWasCancelled] = useState<boolean>(false)

	const { updateItemStateOnItems } = useItems(list)
	const selectRef = useRef<HTMLIonSelectElement | null>(null)

	useEffect(() => {
		if (openSelect) {
			selectRef.current?.open()
		}
	}, [openSelect])

	const getSelectOptions = (): JSX.Element[] => {
		const values: (string | ItemState)[] = getItemStateValues()
		return values.map((value, index) => (
			<IonSelectOption key={index} value={index}>
				{value}
			</IonSelectOption>
		))
	}

	const handleChange = (event: CustomEvent<SelectChangeEventDetail<ItemState | undefined>>) => {
		if (typeof event.detail.value === 'string' || typeof event.detail.value === null) return

		const updatedState: ItemState | undefined = event.detail.value
		if (selectedState === updatedState) return

		setSelectedState(updatedState)
	}

	const handleDismiss = () => {
		if (!wasCancelled) {
			if (selectedState !== undefined) {
				updateItemStateOnItems(selectedItems, selectedState)
			}
			setWasCancelled(false)
		}
	}

	return (
		<IonSelect
			ref={selectRef}
			value={defaultValue}
			onIonChange={handleChange}
			onIonCancel={() => setWasCancelled(true)}
			onIonDismiss={handleDismiss}
		>
			{getSelectOptions()}
		</IonSelect>
	)
}

export default ItemStateSelect
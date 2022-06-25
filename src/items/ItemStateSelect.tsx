import { IonSelect, IonSelectOption, SelectChangeEventDetail } from "@ionic/react"
import { useEffect, useRef, useState } from "react"
import { useRecoilState } from "recoil"
import { List } from "../lists/listModel"
import { getItemStateValues, getLowestItemState } from "../utils/itemStateUtils"
import { Item, ItemPerson, itemsState, ItemState } from "./itemModel"

interface ItemStateSelectProps {
	list: List
	selectedItems: Item[]
	openSelect: boolean
}

const ItemStateSelect: React.FC<ItemStateSelectProps> = ({ list, selectedItems, openSelect }) => {
	const [items, setItems] = useRecoilState(itemsState(list.id))

	const defaultValue: ItemState | undefined = selectedItems.length === 1 ?
		(selectedItems[0].persons.length > 0 ?
			getLowestItemState(selectedItems[0].persons) :
			selectedItems[0].state
		)
		:
		undefined
	const [selectedState, setSelectedState] = useState<ItemState | undefined>(defaultValue)
	const [wasCancelled, setWasCancelled] = useState<boolean>(false)

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
				updateItemStateOnSelectedItems(selectedState)
			}
			setWasCancelled(false)
		}
	}

	const updateItemStateOnSelectedItems = (state: ItemState) => {
		const updatedItems: Item[] = items.map(item => {
			if (selectedItems.some(si => si.id === item.id)) {
				return getUpdatedItem(item, state)
			}
			return item
		})
		setItems(updatedItems)
	}

	const getUpdatedItem = (item: Item, state: ItemState): Item => {
		if (item.persons.length > 0) {
			return getUpdatedItemPersonStates(item, state)
		} else {
			return getUpdatedMainItemState(item, state)
		}
	}

	const getUpdatedItemPersonStates = (item: Item, state: ItemState): Item => {
		const updatedItemPersons: ItemPerson[] = item.persons.map(ip => {
			return {
				...ip,
				state
			}
		})
		const updatedItem: Item = {
			...item,
			persons: updatedItemPersons
		}
		return updatedItem
	}

	const getUpdatedMainItemState = (item: Item, state: ItemState): Item => {
		const updatedItem: Item = {
			...item,
			state
		}
		return updatedItem
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
import { IonAccordion, IonAccordionGroup, IonItem, IonLabel, IonList, IonSelect, IonSelectOption, SelectChangeEventDetail } from "@ionic/react"
import { useEffect, useState } from "react"
import AddItemInput from "../items/AddItemInput"
import ItemRow from "../items/ItemRow"
import { List } from "./listModels"
import Modal from "../general/Modal"
import ItemSelect from "../items/ItemSelect"
import Fab from "../general/Fab"
import { useRecoilState, useRecoilValue } from "recoil"
import ItemSelectRow from "../items/ItemSelectRow"
import { multiSelectState, selectedItemsState } from "../state/state"
import MultiSelectActions from "../general/MultiSelectActions"
import { getCurrentItemState, getItemStateValues } from "../utils/itemStateUtils"
import { Item, ItemState } from "../items/itemModels"

interface ListViewProps {
	list: List
}

interface Filters {
	itemState?: ItemState[]
}

const ListView: React.FC<ListViewProps> = ({ list }) => {
	const isMultiSelectMode = useRecoilValue(multiSelectState)
	const [selectedItems, setSelectedItems] = useRecoilState(selectedItemsState)

	const [isAddItemInputOpen, setIsAddItemInputOpen] = useState<boolean>(false)
	const [filters, setFilters] = useState<Filters>({})

	const filteredItems: Item[] = list.items.filter(item => {
		if (!filters.itemState || filters.itemState.length === 0) {
			return true
		}
		return filters.itemState.includes(getCurrentItemState(item))
	})

	const handleItemStateChange = (event: CustomEvent<SelectChangeEventDetail<ItemState[]>>) => {
		const updatedItemState: ItemState[] = event.detail.value
		const updatedFilters: Filters = {
			...filters,
			itemState: updatedItemState,
		}
		setFilters(updatedFilters)
	}

	return (
		<>
			<FilterAccordion
				onItemStateChange={handleItemStateChange}
			/>
			<IonList>
				{filteredItems.map(item => {
					if (isMultiSelectMode) {
						return <ItemSelectRow
							key={item.id}
							item={item}
							selectedItems={selectedItems}
							setSelectedItems={setSelectedItems}
						/>
					}
					return <ItemRow key={item.id} list={list} item={item} />
				})}
			</IonList>
			{!isMultiSelectMode ?
				<Fab onClick={() => setIsAddItemInputOpen(true)} />
				:
				<MultiSelectActions list={list} />
			}
			<Modal isOpen={isAddItemInputOpen} setIsOpen={setIsAddItemInputOpen}>
				{list.isMaster ?
					<AddItemInput list={list} />
					:
					<ItemSelect list={list} />
				}
			</Modal>
		</>
	)
}

export default ListView



interface FilterAccordionProps {
	onItemStateChange: (event: CustomEvent<SelectChangeEventDetail<ItemState[]>>) => void
}

const FilterAccordion: React.FC<FilterAccordionProps> = ({ onItemStateChange }) => {
	return (
		<IonAccordionGroup>
			<IonAccordion>
				<IonItem slot="header" lines="none">
					<IonLabel>Filters</IonLabel>
				</IonItem>
				<IonList slot="content">
					<IonItem>
						<IonLabel>State:</IonLabel>
						<IonSelect multiple onIonChange={onItemStateChange}>
							{getItemStateValues().map((itemState, index) => (
								<IonSelectOption key={index} value={index}>
									{itemState}
								</IonSelectOption>
							))}
						</IonSelect>
					</IonItem>
				</IonList>
			</IonAccordion>
		</IonAccordionGroup>
	)
}
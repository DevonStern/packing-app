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
import { Tag, tagsState } from "../tags/tagModel"

interface ListViewProps {
	list: List
}

interface Filters {
	itemState?: ItemState[]
	tag?: Tag[]
}

const ListView: React.FC<ListViewProps> = ({ list }) => {
	const isMultiSelectMode = useRecoilValue(multiSelectState)
	const [selectedItems, setSelectedItems] = useRecoilState(selectedItemsState)
	const tags = useRecoilValue(tagsState)

	const [isAddItemInputOpen, setIsAddItemInputOpen] = useState<boolean>(false)
	const [filters, setFilters] = useState<Filters>({})

	const filteredItems: Item[] = list.items.filter(item => {
		const hasItemStateFilter: boolean = filters.itemState !== undefined && filters.itemState.length > 0
		const hasTagFilter: boolean = filters.tag !== undefined && filters.tag.length > 0
		return (
			(!hasItemStateFilter || filters.itemState!.includes(getCurrentItemState(item)))
			&& (!hasTagFilter || filters.tag!.some(ft => {
				return item.tags.some(it => {
					return it.id === ft.id
				})
			}))
		)
	})

	const handleItemStateFilterChange = (event: CustomEvent<SelectChangeEventDetail<ItemState[]>>) => {
		const updatedItemState: ItemState[] = event.detail.value
		const updatedFilters: Filters = {
			...filters,
			itemState: updatedItemState,
		}
		setFilters(updatedFilters)
	}

	const handleTagFilterChange = (event: CustomEvent<SelectChangeEventDetail<string[]>>) => {
		const updatedIds: string[] = event.detail.value
		const updatedTags: Tag[] = updatedIds.map(id => {
			const tag: Tag | undefined = tags.find(t => t.id === id)
			if (!tag) {
				throw new Error(`Could not find tag with matching ID to the filter - ID: ${id}`)
			}
			return tag
		})
		const updatedFilters: Filters = {
			...filters,
			tag: updatedTags,
		}
		setFilters(updatedFilters)
	}

	return (
		<>
			<FilterAccordion
				// filters={filters}
				onItemStateChange={handleItemStateFilterChange}
				onTagChange={handleTagFilterChange}
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
	// filters: Filters
	onItemStateChange: (event: CustomEvent<SelectChangeEventDetail<ItemState[]>>) => void
	onTagChange: (event: CustomEvent<SelectChangeEventDetail<string[]>>) => void
}

const FilterAccordion: React.FC<FilterAccordionProps> = ({
	// filters,
	onItemStateChange,
	onTagChange,
}) => {
	const tags = useRecoilValue(tagsState)

	// const handleChange = (event: CustomEvent<SelectChangeEventDetail<string[]>>) => {
	// 	if (typeof event.detail.value === 'string') return

	// 	const updatedIds: string[] = event.detail.value
	// 	const previousIds: string[] = filters.tag?.map(t => t.id) ?? []
	// 	if (JSON.stringify(previousIds) === JSON.stringify(updatedIds)) return

	// 	onTagChange(event)
	// }

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
					<IonItem>
						<IonLabel>Tag:</IonLabel>
						<IonSelect
							multiple
							onIonChange={onTagChange}
							// onIonChange={handleChange}
						>
							{tags.map(tag => (
								<IonSelectOption key={tag.id} value={tag.id}>
									{tag.name}
								</IonSelectOption>
							))}
						</IonSelect>
					</IonItem>
				</IonList>
			</IonAccordion>
		</IonAccordionGroup>
	)
}
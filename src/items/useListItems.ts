import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil"
import { List, listsState, masterListState } from "../lists/listModels"
import { Person, personsState } from "../persons/personModel"
import { Tag, tagsState } from "../tags/tagModel"
import { getItemPersonWithNextState } from "../utils/itemStateUtils"
import { DEFAULT_ITEM_STATE, Item, ItemPerson, ItemState, makeItem } from "./itemModels"
import useItemUpdates from "./useItemUpdates"

const useListItems = (list: List) => {
	const setLists = useSetRecoilState(listsState)
	const [masterList, setMasterList] = useRecoilState(masterListState)
	const persons = useRecoilValue(personsState)
	const tags = useRecoilValue(tagsState)

	const { getItemWithOverriddenPropIfNeeded } = useItemUpdates()

	const setItem = (item: Item, updatedItem: Item) => {
		const updatedItems: Item[] = list.items.map(i => {
			if (i.id === item.id) {
				return updatedItem
			}
			return i
		})
		setItems(updatedItems)
	}

	const setSelectedItems = (
		selectedItems: Item[],
		updatedValue: any,
		getUpdatedItem: (item: Item, updatedValue: any) => Item
	) => {
		const updatedItems: Item[] = list.items.map(item => {
			if (selectedItems.some(si => si.id === item.id)) {
				return getUpdatedItem(item, updatedValue)
			}
			return item
		})
		setItems(updatedItems)
	}

	const setItems = (updatedItems: Item[]) => {
		const updatedList: List = {
			...list,
			items: updatedItems
		}
		setLists(previousLists => {
			return previousLists.map(l => {
				if (l.id === list.id) {
					return updatedList
				}
				return l
			})
		})
	}

	const createItem = (name: string) => {
		const newItem: Item = makeItem(name)
		const updatedItems: Item[] = [
			...list.items,
			newItem
		]
		setItems(updatedItems)
	}

	const assignItems = (selectedItems: Item[]) => {
		addItemsToList(selectedItems)
		addListToMasterItems(selectedItems)
	}

	const addItemsToList = (selectedItems: Item[]) => {
		const selectedItemsWithoutListIds: Item[] = selectedItems.map<Item>(item => {
			const { assignedToListIds, ...itemWithoutListIds } = item
			return itemWithoutListIds
		})
		const updatedItems: Item[] = [
			...list.items,
			...selectedItemsWithoutListIds
		]
		setItems(updatedItems)
	}

	const addListToMasterItems = (selectedItems: Item[]) => {
		const selectedItemsWithListIds: Item[] = selectedItems.map<Item>(item => ({
			...item,
			assignedToListIds: getAssignedToListIds(item)
		}))
		const updatedMasterItems: Item[] = masterList.items.map(item => {
			const selectedItem: Item | undefined = selectedItemsWithListIds.find(selectedItem => selectedItem.id === item.id)
			if (selectedItem) {
				return selectedItem
			}
			return item
		})
		const updatedMasterList: List = {
			...masterList,
			items: updatedMasterItems
		}
		setMasterList(updatedMasterList)
	}

	const getAssignedToListIds = (item: Item): string[] => {
		if (item.assignedToListIds) {
			return [
				...item.assignedToListIds,
				list.id
			]
		}
		return [list.id]
	}

	const deleteItem = (item: Item) => {
		if (list.isMaster) {
			deleteItemFromLinkedLists(item)
		} else {
			deleteLinkFromMasterListItem(item)
		}
		deleteItemFromList(item)
	}

	const deleteItemFromLinkedLists = (item: Item) => {
		const listIds: string[] = item.assignedToListIds ?? []
		setLists((previousLists) => {
			return previousLists.map(l => {
				if (listIds.includes(l.id)) {
					return getListWithItemRemoved(l, item)
				}
				return l
			})
		})
	}

	const getListWithItemRemoved = (l: List, item: Item): List => {
		const updatedItems: Item[] = l.items.filter(i => i.id !== item.id)
		const updatedList: List = {
			...l,
			items: updatedItems
		}
		return updatedList
	}

	const deleteLinkFromMasterListItem = (item: Item) => {
		const masterListItem: Item | undefined = masterList.items.find(i => i.id === item.id)
		if (!masterListItem) {
			throw new Error(`Master list item not found - id = ${list.id}`)
		}
		const updatedAssignedToListIds: string[] | undefined = masterListItem.assignedToListIds ?
			masterListItem.assignedToListIds.filter(id => id !== list.id) :
			undefined
		const updatedMasterListItem: Item = {
			...masterListItem,
			assignedToListIds: updatedAssignedToListIds
		}
		const updatedMasterListItems: Item[] = masterList.items.map(i => {
			if (i.id === item.id) {
				return updatedMasterListItem
			}
			return i
		})
		setMasterList((previousMasterList) => ({
			...previousMasterList,
			items: updatedMasterListItems
		}))
	}

	const deleteItemFromList = (item: Item) => {
		const updatedList: List = getListWithItemRemoved(list, item)
		setLists((previousLists) => {
			return previousLists.map(l => {
				if (l.id === list.id) {
					return updatedList
				}
				return l
			})
		})
	}

	const updateItemStateOnItems = (selectedItems: Item[], state: ItemState) => {
		setSelectedItems(selectedItems, state, getItemWithUpdatedState)
	}

	const getItemWithUpdatedState = (item: Item, state: ItemState): Item => {
		if (item.persons.length > 0) {
			return getUpdatedItemPersonStates(item, state)
		} else {
			return getUpdatedMainItemState(item, state)
		}
	}

	const getUpdatedItemPersonStates = (item: Item, state: ItemState): Item => {
		const itemWithOverriddenProp: Item = getItemWithOverriddenPropIfNeeded(list, item, 'persons')
		const updatedItemPersons: ItemPerson[] = itemWithOverriddenProp.persons.map(ip => {
			return {
				...ip,
				state
			}
		})
		const updatedItem: Item = {
			...itemWithOverriddenProp,
			persons: updatedItemPersons
		}
		return updatedItem
	}

	const getUpdatedMainItemState = (item: Item, state: ItemState): Item => {
		const itemWithOverriddenProp: Item = getItemWithOverriddenPropIfNeeded(list, item, 'state')
		const updatedItem: Item = {
			...itemWithOverriddenProp,
			state
		}
		return updatedItem
	}

	const updateItemPersonsOnItems = (selectedItems: Item[], personIds: string[]) => {
		const updatedPersons: Person[] = persons.filter(p => personIds.some(id => id === p.id))
		setSelectedItems(selectedItems, updatedPersons, getItemWithUpdatedPersons)
	}

	const getItemWithUpdatedPersons = (item: Item, updatedPersons: Person[]): Item => {
		const itemWithOverriddenProp: Item = getItemWithOverriddenPropIfNeeded(list, item, 'persons')
		const updatedItemPersons: ItemPerson[] = updatedPersons.map(person => {
			const currentItemPerson: ItemPerson | undefined = itemWithOverriddenProp.persons.find(ip => ip.person.id === person.id)
			const state: ItemState = currentItemPerson?.state ?? DEFAULT_ITEM_STATE
			const updatedItemPerson: ItemPerson = {
				person,
				state,
			}
			return updatedItemPerson
		})
		return {
			...itemWithOverriddenProp,
			persons: updatedItemPersons
		}
	}

	const updateTagsOnItems = (selectedItems: Item[], tagIds: string[]) => {
		const updatedTags: Tag[] = tags.filter(t => tagIds.some(id => id === t.id))
		setSelectedItems(selectedItems, updatedTags, getItemWithUpdatedTags)
	}

	const getItemWithUpdatedTags = (item: Item, tags: Tag[]): Item => {
		const itemWithOverriddenProp: Item = getItemWithOverriddenPropIfNeeded(list, item, 'tags')
		const updatedItem: Item = {
			...itemWithOverriddenProp,
			tags,
		}
		return updatedItem
	}

	const updateItemName = (item: Item, name: string) => {
		const itemWithOverriddenProp: Item = getItemWithOverriddenPropIfNeeded(list, item, 'name')
		const updatedItem: Item = {
			...itemWithOverriddenProp,
			name,
		}
		setItem(item, updatedItem)
	}

	const advanceItemPersonState = (item: Item, itemPerson: ItemPerson) => {
		const itemWithOverriddenProp: Item = getItemWithOverriddenPropIfNeeded(list, item, 'persons')
		const updatedItemPerson: ItemPerson = getItemPersonWithNextState(itemPerson)
		const updatedItemPersons: ItemPerson[] = itemWithOverriddenProp.persons.map(ip => {
			if (ip.person.id === itemPerson.person.id) {
				return updatedItemPerson
			}
			return ip
		})
		const updatedItem: Item = {
			...itemWithOverriddenProp,
			persons: updatedItemPersons
		}
		setItem(item, updatedItem)
	}

	return {
		setItem,
		createItem,
		assignItems,
		deleteItem,
		updateItemStateOnItems,
		updateItemPersonsOnItems,
		updateTagsOnItems,
		updateItemName,
		advanceItemPersonState,
	}
}

export default useListItems
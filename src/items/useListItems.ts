import { DefaultValue, selectorFamily, useRecoilState, useRecoilValue, useSetRecoilState } from "recoil"
import { List, listsState, masterListState } from "../lists/listModels"
import { BasePerson, basePersonsState } from "../persons/personModel"
import { BaseTag, baseTagsState } from "../tags/tagModel"
import { makeItemPersonWithNextState } from "../utils/itemStateUtils"
import { DEFAULT_ITEM_STATE, Item, ItemPerson, ItemState, makeItem } from "./itemModels"
import useItemUpdates from "./useItemUpdates"

const listItemsState = selectorFamily({
	key: 'listItemsState',
	get: (listId: string) => ({ get }) => {
		const list = get(listsState).find(potentialMatch => potentialMatch.id === listId)
		if (!list) throw new Error(`Failed to find matching list when getting list items: listId = ${listId}`)
		return list.items
	},
	set: (listId: string) => ({ set }, newItems) => {
		if (newItems instanceof DefaultValue) {
			throw new Error(`DefaultValue? That shouldn't happen at all.`)
		}
		set(listsState, (previousLists) => {
			return previousLists.map(list => {
				if (list.id === listId) {
					return {
						...list,
						items: newItems,
					}
				}
				return list
			})
		})
	},
})

const useListItems = (listId: string) => {
	const setLists = useSetRecoilState(listsState)
	const [{ id: masterListId }, setMasterList] = useRecoilState(masterListState)
	const setItems = useSetRecoilState(listItemsState(listId))
	const basePersons = useRecoilValue(basePersonsState)
	const baseTags = useRecoilValue(baseTagsState)

	const isMasterList = listId === masterListId
	const { makeItemWithOverriddenPropIfNeeded } = useItemUpdates(isMasterList)

	const setItem = (updatedItem: Item) => {
		setItems((oldItems) => {
			return oldItems.map(i => {
				if (i.id === updatedItem.id) {
					return {
						...updatedItem,
						updatedOn: new Date(),
					}
				}
				return i
			})
		})
	}

	const setSelectedItems = (
		selectedItems: Item[],
		updatedValue: any,
		makeUpdatedItem: (item: Item, updatedValue: any) => Item
	) => {
		setItems((oldItems) => {
			return oldItems.map(item => {
				if (selectedItems.some(si => si.id === item.id)) {
					return {
						...makeUpdatedItem(item, updatedValue),
						updatedOn: new Date(),
					}
				}
				return item
			})
		})
	}

	const createItem = (name: string) => {
		setItems((oldItems) => [
			...oldItems,
			makeItem(listId, name, oldItems.length),
		])
	}

	const assignItems = (selectedItems: Item[]) => {
		addItemsToList(selectedItems)
		addListToMasterItems(selectedItems)
	}

	const addItemsToList = (selectedItems: Item[]) => {
		setItems((oldItems) => {
			const selectedItemsWithoutListIds: Item[] = selectedItems.map<Item>(item => {
				const { assignedToListIds, ...itemWithoutListIds } = item
				return itemWithoutListIds
			})
			let nextSortOrder: number = oldItems.length - 1
			const itemsToAdd: Item[] = selectedItemsWithoutListIds.map(item => {
				nextSortOrder++
				return {
					...item,
					listId,
					createdOn: new Date(),
					updatedOn: new Date(),
					sortOrder: nextSortOrder,
				}
			})
			console.debug('added list items', [...oldItems, ...itemsToAdd])
			return [
				...oldItems,
				...itemsToAdd,
			]
		})
	}

	const addListToMasterItems = (selectedItems: Item[]) => {
		setMasterList((oldMasterList) => {
			const selectedItemsWithNewListIds: Item[] = selectedItems.map<Item>(item => ({
				...item,
				assignedToListIds: makeAssignedToListIds(item),
				updatedOn: new Date(),
			}))
			const updatedMasterItems: Item[] = oldMasterList.items.map(item => {
				const selectedItem: Item | undefined = selectedItemsWithNewListIds.find(selectedItem => selectedItem.id === item.id)
				if (selectedItem) {
					return selectedItem
				}
				return item
			})
			console.debug('updated master list items', { ...oldMasterList, items: updatedMasterItems })
			return {
				...oldMasterList,
				items: updatedMasterItems,
			}
		})
	}

	const makeAssignedToListIds = (item: Item): string[] => {
		if (item.assignedToListIds) {
			return [
				...item.assignedToListIds,
				listId,
			]
		}
		return [listId]
	}

	const deleteItem = (item: Item) => {
		if (isMasterList) {
			deleteItemFromLinkedLists(item)
		} else {
			deleteLinkFromMasterListItem(item)
		}
		deleteItemFromList(item)
	}

	const deleteItemFromLinkedLists = (item: Item) => {
		const listIds: string[] = item.assignedToListIds ?? []
		setLists((previousLists) => {
			return previousLists.map(list => {
				if (listIds.includes(list.id)) {
					return makeListWithItemRemoved(list, item)
				}
				return list
			})
		})
	}

	const makeListWithItemRemoved = (list: List, item: Item): List => {
		const index = list.items.findIndex(i => i.id === item.id)
		if (index === -1) {
			throw new Error(`Could not find list item to delete: listId = ${list.id}, itemId = ${item.id}`)
		}
		const updatedItems: Item[] = [
			...list.items.slice(0, index),
			...list.items.slice(index + 1)
				.map(i => ({
					...i,
					sortOrder: i.sortOrder - 1, // Adjust sort orders down
					updatedOn: new Date(),
				})),
		]
		const updatedList: List = {
			...list,
			items: updatedItems,
		}
		return updatedList
	}

	const deleteLinkFromMasterListItem = (item: Item) => {
		setMasterList((previousMasterList) => {
			const masterListItem: Item | undefined = previousMasterList.items.find(i => i.id === item.id)
			if (!masterListItem) {
				throw new Error(`Master list item not found while deleting link from master list item:` +
					` listId = ${listId}, itemId = ${item.id}`
				)
			}
			const updatedAssignedToListIds: string[] | undefined = masterListItem.assignedToListIds ?
				masterListItem.assignedToListIds.filter(id => id !== listId) :
				undefined
			const updatedMasterListItem: Item = {
				...masterListItem,
				assignedToListIds: updatedAssignedToListIds,
				updatedOn: new Date(),
			}
			const updatedMasterListItems: Item[] = previousMasterList.items.map(i => {
				if (i.id === item.id) {
					return updatedMasterListItem
				}
				return i
			})
			return {
				...previousMasterList,
				items: updatedMasterListItems
			}
		})
	}

	const deleteItemFromList = (item: Item) => {
		setLists((previousLists) => {
			const list = previousLists.find(l => l.id === listId)
			if (!list) {
				throw new Error(`List not found while deleting item from list: listId = ${listId}, itemId = ${item.id}`)
			}
			const updatedList: List = makeListWithItemRemoved(list, item)
			return previousLists.map(l => {
				if (l.id === listId) {
					return updatedList
				}
				return l
			})
		})
	}

	const updateItemStateOnItems = (selectedItems: Item[], state: ItemState) => {
		setSelectedItems(selectedItems, state, makeItemWithUpdatedState)
	}

	const makeItemWithUpdatedState = (item: Item, state: ItemState): Item => {
		if (item.persons.length > 0) {
			return makeUpdatedItemPersonStates(item, state)
		} else {
			return makeUpdatedMainItemState(item, state)
		}
	}

	const makeUpdatedItemPersonStates = (item: Item, state: ItemState): Item => {
		const itemWithOverriddenProp: Item = makeItemWithOverriddenPropIfNeeded(item, 'persons')
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

	const makeUpdatedMainItemState = (item: Item, state: ItemState): Item => {
		const itemWithOverriddenProp: Item = makeItemWithOverriddenPropIfNeeded(item, 'state')
		const updatedItem: Item = {
			...itemWithOverriddenProp,
			state
		}
		return updatedItem
	}

	const updateItemPersonsOnItems = (selectedItems: Item[], personIds: string[]) => {
		const updatedPersons = basePersons.filter(p => personIds.some(id => id === p.id))
		setSelectedItems(selectedItems, updatedPersons, makeItemWithUpdatedPersons)
	}

	const makeItemWithUpdatedPersons = (item: Item, updatedPersons: BasePerson[]): Item => {
		const itemWithOverriddenProp: Item = makeItemWithOverriddenPropIfNeeded(item, 'persons')
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
		const updatedTags = baseTags.filter(t => tagIds.some(id => id === t.id))
		setSelectedItems(selectedItems, updatedTags, makeItemWithUpdatedTags)
	}

	const makeItemWithUpdatedTags = (item: Item, tags: BaseTag[]): Item => {
		const itemWithOverriddenProp: Item = makeItemWithOverriddenPropIfNeeded(item, 'tags')
		const updatedItem: Item = {
			...itemWithOverriddenProp,
			tags,
		}
		return updatedItem
	}

	const addTagsOnItems = (selectedItems: Item[], tagIds: string[]) => {
		const addedTags = baseTags.filter(t => tagIds.some(id => id === t.id))
		setSelectedItems(selectedItems, addedTags, makeItemWithAddedTags)
	}

	const makeItemWithAddedTags = (item: Item, tags: BaseTag[]): Item => {
		const itemWithOverriddenProp: Item = makeItemWithOverriddenPropIfNeeded(item, 'tags')
		const newTags: BaseTag[] = tags.filter(t => !item.tags.some(it => it.id === t.id))
		const updatedItem: Item = {
			...itemWithOverriddenProp,
			tags: [
				...item.tags,
				...newTags,
			],
		}
		return updatedItem
	}

	const updateItemName = (item: Item, name: string) => {
		const itemWithOverriddenProp: Item = makeItemWithOverriddenPropIfNeeded(item, 'name')
		const updatedItem: Item = {
			...itemWithOverriddenProp,
			name,
		}
		setItem(updatedItem)
	}

	const advanceItemPersonState = (item: Item, itemPerson: ItemPerson) => {
		const itemWithOverriddenProp: Item = makeItemWithOverriddenPropIfNeeded(item, 'persons')
		const updatedItemPerson: ItemPerson = makeItemPersonWithNextState(itemPerson)
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
		setItem(updatedItem)
	}

	return {
		setItem,
		createItem,
		assignItems,
		deleteItem,
		updateItemStateOnItems,
		updateItemPersonsOnItems,
		updateTagsOnItems,
		addTagsOnItems,
		updateItemName,
		advanceItemPersonState,
	}
}

export default useListItems
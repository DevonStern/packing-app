import { Storage } from "@capacitor/storage";
import { getChangesFromDynamoDb } from "../utils/serverUtils";
import { TABLE_TAGS, Tag, fetchedTagsState, parseTags, tagsState } from "../tags/tagModel";
import { SetterOrUpdater, useRecoilState, useSetRecoilState } from "recoil";
import { syncFlag } from "../flags";
import { Person, TABLE_PERSONS, fetchedPersonsState, parsePersons, personsState } from "../persons/personModel";
import { CreatedUpdated, Deletable, Sortable, WithId } from "../constants/modelConstants";
import { List, ServerList, TABLE_LISTS, fetchedListsState, listsState, parseServerLists, makeListConverter } from "../lists/listModels";
import { useEffect, useState } from "react";
import { Item, TABLE_ITEMS, allItemsState, fetchedItemsState, parseItems } from "../items/itemModels";

const STORAGE_KEY_SYNC = 'sync'

export const getSyncedOn = async (): Promise<Date> => {
	const { value } = await Storage.get({ key: STORAGE_KEY_SYNC })
	return value ? new Date(value) : new Date(0)
}

export const setSyncedOnNow = async () => {
	await Storage.set({
		key: STORAGE_KEY_SYNC,
		value: new Date().toISOString(),
	})
}

const useSync = () => {
	const setPersons = useSetRecoilState(personsState)
	const setFetchedPersons = useSetRecoilState(fetchedPersonsState)

	const setTags = useSetRecoilState(tagsState)
	const setFetchedTags = useSetRecoilState(fetchedTagsState)

	const setLists = useSetRecoilState(listsState)
	const setFetchedLists = useSetRecoilState(fetchedListsState)

	const [allItems, setAllItems] = useRecoilState(allItemsState)
	const setFetchedItems = useSetRecoilState(fetchedItemsState)

	useEffect(() => {
		console.debug('allItems', allItems)
		console.debug('master list items', allItems.filter(i => i.listId === 'masterId'))
	}, [allItems])

	const sync = async () => {
		if (!syncFlag) return

		// Fetch in dependency order
		await syncTable<Person>({
			tableName: TABLE_PERSONS,
			parser: parsePersons,
			set: setPersons,
			setFetched: setFetchedPersons,
		})
		await syncTable<Tag>({
			tableName: TABLE_TAGS,
			parser: parseTags,
			set: setTags,
			setFetched: setFetchedTags,
		})
		// Sync lists before items so we can update the items on the lists afterward
		const { convertServerListsToLists } = makeListConverter(allItems)
		await syncTable<List, ServerList>({
			tableName: TABLE_LISTS,
			parser: parseServerLists,
			set: setLists,
			setFetched: setFetchedLists,
			converter: convertServerListsToLists,
		})
		await syncTable<Item>({
			tableName: TABLE_ITEMS,
			parser: parseItems,
			set: setAllItems,
			setFetched: setFetchedItems,
		})

		await setSyncedOnNow()
	}

	const syncTable = async <
		T extends WithId & Sortable & CreatedUpdated,
		ServerT extends WithId & Sortable & CreatedUpdated = T
	>({
		tableName,
		parser,
		set,
		setFetched,
		converter = defaultConverter,
	}: {
		tableName: string,
		parser: (records: Partial<ServerT & Deletable>[]) => ServerT[],
		set: SetterOrUpdater<T[]>,
		setFetched: SetterOrUpdater<(ServerT & Deletable)[]>,
		converter?: (records: (ServerT & Deletable)[]) => (T & Deletable)[],
	}) => {
		console.group(`sync table ${tableName}`)
		const changes = await getChangesFromServer(tableName, parser, setFetched, converter)
		if (changes.length > 0) {
			set(values => {
				const currentWithoutDeleted = changes[0].hasOwnProperty('listId') ?
					values.filter(v => !changes.find(change =>
						change.id === v.id &&
						(change as any).listId === (v as any).listId &&
						change.deleted
					)) :
					values.filter(v => !changes.find(change =>
						change.id === v.id &&
						change.deleted
					))
				console.debug('current without deleted', currentWithoutDeleted)
				// console.debug('deleted removed', deletedRemoved.filter(r => r.id === 'e223571d-2d14-4fb9-8910-eb2b30445a38'))
				const changesWithoutDeleted = changes.filter(c => !c.deleted)
				console.debug('changes without deleted', changesWithoutDeleted)
				// console.debug('changes without deleted', changesWithoutDeleted.filter(r => r.id === 'e223571d-2d14-4fb9-8910-eb2b30445a38'))
				const mergedValues = mergeChanges(currentWithoutDeleted, changesWithoutDeleted)
				console.debug('merged', mergedValues)
				// console.debug('merged', mergedValues.filter(r => r.id === 'e223571d-2d14-4fb9-8910-eb2b30445a38'))
				const sortedValues = groupAndSort(mergedValues)
				console.debug('sorted', sortedValues)
				// console.debug('sorted', sortedValues.filter(r => r.id === 'e223571d-2d14-4fb9-8910-eb2b30445a38'))
				return sortedValues
			})
		}
		console.groupEnd()
	}

	const defaultConverter = <T, ServerT>(records: ServerT[]): T[] => (records as any as T[])

	const getChangesFromServer = async<
		T extends WithId & Sortable & CreatedUpdated,
		ServerT extends WithId & Sortable & CreatedUpdated = T
	>(
		tableName: string,
		parser: (records: Partial<ServerT & Deletable>[]) => ServerT[],
		setFetched: SetterOrUpdater<(ServerT & Deletable)[]>,
		converter: (records: (ServerT & Deletable)[]) => (T & Deletable)[],
	): Promise<(T & Deletable)[]> => {
		const rawChanges = await getChangesFromDynamoDb(tableName, parser)
		console.debug('raw changes', rawChanges)
		// console.debug('raw changes', rawChanges.filter(r => r.id === 'e223571d-2d14-4fb9-8910-eb2b30445a38'))
		setFetched(rawChanges)
		const changes = converter(rawChanges)
		console.debug('converted changes', changes)
		// console.debug('converted changes', changes.filter(r => r.id === 'e223571d-2d14-4fb9-8910-eb2b30445a38'))
		return changes
	}

	const mergeChanges = <T extends WithId & CreatedUpdated>(oldValues: T[], changes: T[]): T[] => {
		const updateExisting = () => {
			if (oldValues.length === 0) {
				return []
			}
			const getChanged = oldValues[0].hasOwnProperty('listId') ?
				(oldValue: any) => changes.find(c => c.id === oldValue.id && (c as any).listId === oldValue.listId) :
				(oldValue: T) => changes.find(c => c.id === oldValue.id)
			return oldValues.map(oldValue => {
				const changed = getChanged(oldValue)
				if (!changed) return oldValue
				if (changed.updatedOn > oldValue.updatedOn) return changed
				return oldValue
			})
		}
		const updatedExisting: T[] = updateExisting()

		const getAdded = () => {
			if (changes.length === 0) {
				return []
			}
			const wasAdded = changes[0].hasOwnProperty('listId') ?
				(change: any) => !oldValues.find(v => v.id === change.id && (v as any).listId === change.listId) :
				(change: T) => !oldValues.find(v => v.id === change.id)
			return changes.filter(wasAdded)
		}
		const added: T[] = getAdded()

		return [
			...updatedExisting,
			...added,
		]
	}

	const groupAndSort = <T extends Sortable & CreatedUpdated>(array: T[]): T[] => {
		const groupByListId = (allItems: Item[]): Item[][] => {
			const groupedItems: Item[][] = []
			allItems.forEach(item => {
				let foundMatch = false
				groupedItems.forEach((listItems, groupIndex) => {
					if (item.listId === listItems[0].listId) {
						groupedItems[groupIndex] = [...listItems, item]
						foundMatch = true
						return
					}
				})
				if (!foundMatch) {
					groupedItems.push([item])
				}
			})
			return groupedItems
		}

		const sortBySortOrder = (sortArray: T[]): T[] => {
			const sorted = [...sortArray].sort((a: T, b: T) => {
				if (a.sortOrder === b.sortOrder) {
					return a.createdOn < b.createdOn ? -1 : 1
				}
				return a.sortOrder - b.sortOrder
			})
			const updatedSortOrder = sorted.map((v, i) => ({ ...v, sortOrder: i }))
			return updatedSortOrder
		}

		if (!array[0].hasOwnProperty('listId')) {
			return sortBySortOrder(array)
		} else {
			const groupedItems: Item[][] = groupByListId(array as any[])
			console.debug('grouped by list id', groupedItems)
			const sortedByList: T[][] = groupedItems.map(listItems => sortBySortOrder(listItems as any[]))
			console.debug('sorted by list id', sortedByList)
			const allSorted: T[] = sortedByList.flat()
			console.debug('all sorted items', allSorted)
			return allSorted
		}
	}



	return {
		sync,
	}
}

export default useSync
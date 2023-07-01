import { Storage } from "@capacitor/storage";
import { getChangesFromDynamoDb } from "../utils/serverUtils";
import { TABLE_TAGS, Tag, fetchedTagsState, parseTags, tagsState } from "../tags/tagModel";
import { SetterOrUpdater, useSetRecoilState } from "recoil";
import { syncFlag } from "../flags";
import { Person, TABLE_PERSONS, fetchedPersonsState, parsePersons, personsState } from "../persons/personModel";
import { CreatedUpdated, Deletable, Sortable, WithId } from "../constants/modelConstants";
import { List, ServerList, TABLE_LISTS, fetchedListsState, listsState, parseServerLists, useListConverter } from "../lists/listModels";
import { useEffect, useState } from "react";
import { Item, TABLE_ITEMS, fetchedItemsState, parseItems } from "../items/itemModels";

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

	const [allItems, setAllItems] = useState<Item[]>([])
	const setFetchedItems = useSetRecoilState(fetchedItemsState)

	const setLists = useSetRecoilState(listsState)
	const setFetchedLists = useSetRecoilState(fetchedListsState)
	const { convertServerListsToLists } = useListConverter(allItems)

	// Fetch in dependency order
	const sync = async () => {
		if (!syncFlag) return

		await syncTable<Person>(TABLE_PERSONS, parsePersons, setPersons, setFetchedPersons)
		await syncTable<Tag>(TABLE_TAGS, parseTags, setTags, setFetchedTags)
		// await syncTable<Item>(TABLE_ITEMS, parseItems, setAllItems, setFetchedItems)

		await setSyncedOnNow()
	}
	//update item state before syncing lists so items can be put on lists
	// useEffect(() => {
	// 	syncTable<List, ServerList>(TABLE_LISTS, parseServerLists, setLists, setFetchedLists, convertServerListsToLists)
	// }, [allItems])

	const syncTable = async <
		T extends WithId & Sortable & CreatedUpdated,
		ServerT extends WithId & Sortable & CreatedUpdated = T
	>(
		tableName: string,
		parser: (records: Partial<ServerT>[]) => ServerT[],
		set: SetterOrUpdater<T[]>,
		setFetched: SetterOrUpdater<(ServerT & Deletable)[]>,
		converter: (records: (ServerT & Deletable)[]) => (T & Deletable)[] = defaultConverter,
	) => {
		console.group(`sync table ${tableName}`)
		const changes = await getChangesFromServer(tableName, parser, setFetched, converter)
		if (changes.length > 0) {
			set(values => {
				const deletedRemoved = values.filter(v => !changes.find(change => change.id === v.id && change.deleted))
				console.debug('deleted removed', deletedRemoved)
				const changesWithoutDeleted = changes.filter(c => !c.deleted)
				console.debug('changes without deleted', changesWithoutDeleted)
				const mergedValues = mergeChanges(deletedRemoved, changesWithoutDeleted)
				console.debug('merged', mergedValues)
				const sortedValues = sortBySortOrder(mergedValues)
				console.debug('sorted', sortedValues)
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
		parser: (records: Partial<ServerT>[]) => ServerT[],
		setFetched: SetterOrUpdater<(ServerT & Deletable)[]>,
		converter: (records: (ServerT & Deletable)[]) => (T & Deletable)[],
	): Promise<(T & Deletable)[]> => {
		const rawChanges = await getChangesFromDynamoDb(tableName, parser)
		console.debug('raw changes', rawChanges)
		setFetched(rawChanges)
		const changes = converter(rawChanges)
		console.debug('converted changes', changes)
		return changes
	}

	const mergeChanges = <T extends WithId & CreatedUpdated>(oldValues: T[], changes: T[]): T[] => {
		const updatedExisting: T[] = oldValues.map(oldValue => {
			const changed = changes.find(c => c.id === oldValue.id)

			if (!changed) return oldValue
			if (changed.updatedOn > oldValue.updatedOn) return changed
			return oldValue
		})
		const added: T[] = changes.filter(c => !oldValues.find(v => v.id === c.id))

		return [
			...updatedExisting,
			...added,
		]
	}

	const sortBySortOrder = <T extends Sortable & CreatedUpdated>(array: T[]): T[] => {
		const sorted = [...array].sort((a: T, b: T) => {
			if (a.sortOrder === b.sortOrder) {
				return a.createdOn < b.createdOn ? -1 : 1
			}
			return a.sortOrder - b.sortOrder
		})
		const updatedSortOrder = sorted.map((v, i) => ({ ...v, sortOrder: i }))
		return updatedSortOrder
	}

	return {
		sync,
	}
}

export default useSync
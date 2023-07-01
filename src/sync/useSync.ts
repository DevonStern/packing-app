import { Storage } from "@capacitor/storage";
import { getChangesFromDynamoDb } from "../utils/serverUtils";
import { TABLE_TAGS, Tag, fetchedTagsState, parseTags, tagsState } from "../tags/tagModel";
import { SetterOrUpdater, useSetRecoilState } from "recoil";
import { syncFlag } from "../flags";
import { Person, TABLE_PERSONS, fetchedPersonsState, parsePersons, personsState } from "../persons/personModel";
import { CreatedUpdated, Deletable, Sortable, WithId } from "../constants/modelConstants";
import { List, ServerList, TABLE_LISTS, fetchedListsState, listsState, parseServerLists, makeListConverter } from "../lists/listModels";
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

	const [_, setAllItems] = useState<Item[]>([])
	const setFetchedItems = useSetRecoilState(fetchedItemsState)

	const setLists = useSetRecoilState(listsState)
	const setFetchedLists = useSetRecoilState(fetchedListsState)

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
		//update item state before syncing lists so items can be put on lists
		//FIXME: test: is it getting all the items from the server?
		// const allItems = await syncTable<Item>({
		// 	tableName: TABLE_ITEMS,
		// 	parser: parseItems,
		// 	set: setAllItems,
		// 	setFetched: setFetchedItems,
		// })
		// console.debug('allItems from server', allItems)
		// console.debug('master list items from server', allItems.filter(i => i.listId === 'masterId'))
		//FIXME: test: is it adding the itmes to the lists successfully?
		// const { convertServerListsToLists } = makeListConverter(allItems)
		// await syncTable<List, ServerList>({
		// 	tableName: TABLE_LISTS,
		// 	parser: parseServerLists,
		// 	set: setLists,
		// 	setFetched: setFetchedLists,
		// 	converter: convertServerListsToLists,
		// })

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
		parser: (records: Partial<ServerT>[]) => ServerT[],
		set: SetterOrUpdater<T[]>,
		setFetched: SetterOrUpdater<(ServerT & Deletable)[]>,
		converter?: (records: (ServerT & Deletable)[]) => (T & Deletable)[],
	}): Promise<T[]> => {
		console.group(`sync table ${tableName}`)
		let newValues: T[] = []
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
				newValues = sortedValues
				return sortedValues
			})
		} else {
			set(values => {
				newValues = values
				return values
			})
		}
		console.debug('newValues', newValues)
		console.groupEnd()
		return newValues
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
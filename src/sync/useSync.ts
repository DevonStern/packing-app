import { Storage } from "@capacitor/storage";
import { getChangesFromDynamoDb } from "../utils/serverUtils";
import { TABLE_TAGS, fetchedTagsState, tagsState } from "../tags/tagModel";
import { SetterOrUpdater, useSetRecoilState } from "recoil";
import { syncFlag } from "../flags";
import { TABLE_PERSONS, fetchedPersonsState, personsState } from "../persons/personModel";
import { CreatedUpdated, Sortable, WithId } from "../constants/modelConstants";

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

	const sync = async () => {
		if (!syncFlag) return

		await Promise.all([
			syncTable(TABLE_PERSONS, setPersons, setFetchedPersons),
			syncTable(TABLE_TAGS, setTags, setFetchedTags),
		])

		await setSyncedOnNow()
	}

	const syncTable = async <T extends WithId & Sortable & CreatedUpdated>(
		tableName: string,
		set: SetterOrUpdater<T[]>,
		setFetched: SetterOrUpdater<T[]>,
	) => {
		const changes = await getChangesFromDynamoDb<T>(tableName)
		setFetched(changes)
		if (changes.length > 0) {
			set(values => {
				const deletedRemoved: T[] = values.filter(v => !changes.find(change => change.id === v.id && change.deleted))
				console.debug('deleted removed', deletedRemoved)
				const changesWithoutDeleted: T[] = changes.filter(c => !c.deleted)
				console.debug('changes without deleted', changesWithoutDeleted)
				const mergedValues = mergeChanges(deletedRemoved, changesWithoutDeleted)
				console.debug('merged', mergedValues)
				const sortedValues = sortBySortOrder(mergedValues)
				console.debug('sorted', sortedValues)
				return sortedValues
			})
		}
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
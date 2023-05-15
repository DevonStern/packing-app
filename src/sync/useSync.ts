import { Storage } from "@capacitor/storage";
import { getChangesFromDynamoDb } from "../utils/serverUtils";
import { Tag, fetchedTagsState, tagsState } from "../tags/tagModel";
import { useSetRecoilState } from "recoil";

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
	const setTags = useSetRecoilState(tagsState)
	const setFetchedTags = useSetRecoilState(fetchedTagsState)

	const sync = async () => {
		const changes = await getChangesFromDynamoDb<Tag>('Tag')
		setFetchedTags(changes)
		setTags(tags => {
			const deletedRemoved: Tag[] = tags.filter(t => !changes.find(change => change.id === t.id && change.deleted))
			console.debug('deleted removed', deletedRemoved)
			const changesWithoutDeleted: Tag[] = changes.filter(c => !c.deleted)
			console.debug('changes without deleted', changesWithoutDeleted)
			const mergedValues = mergeChanges(deletedRemoved, changesWithoutDeleted)
			console.debug('merged', mergedValues)
			const sortedValues = sortBySortOrder(mergedValues)
			console.debug('sorted', sortedValues)
			return sortedValues
		})
	}

	const mergeChanges = (oldValues: Tag[], changes: Tag[]): Tag[] => {
		const updatedExisting: Tag[] = oldValues.map(oldValue => {
			const changed = changes.find(c => c.id === oldValue.id)

			if (!changed) return oldValue
			if (changed.updatedOn > oldValue.updatedOn) return changed
			return oldValue
		})
		const added: Tag[] = changes.filter(c => !oldValues.find(v => v.id === c.id))

		return [
			...updatedExisting,
			...added,
		]
	}

	const sortBySortOrder = (array: Tag[]): Tag[] => {
		const sorted = [...array].sort((a: Tag, b: Tag) => {
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
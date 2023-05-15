import { Storage } from "@capacitor/storage";
import { getChangesFromDynamoDb } from "../utils/serverUtils";
import { Tag, tagsState } from "../tags/tagModel";
import { useRecoilState } from "recoil";

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
	const [oldTags, setTags] = useRecoilState(tagsState)

	const sync = async () => {
		const tags = oldTags
		// setTags(tags => {
			
		// })
		const changes: Tag[] = await getChangesFromDynamoDb<Tag>('Tag')
		const mergedValues: Tag[] = mergeChanges(tags, changes)
		// console.debug('merged', mergedValues)
		const sortedValues: Tag[] = sortBySortOrder(mergedValues)
		console.debug('sorted', sortedValues)
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
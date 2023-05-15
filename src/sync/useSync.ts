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
	const [tags, setTags] = useRecoilState(tagsState)

	const sync = async () => {
		const changes: Tag[] = await getChangesFromDynamoDb<Tag>('Tag')
		const mergedChanges: Tag[] = mergeChanges(changes)
		console.debug('test', mergedChanges)
	}

	const mergeChanges = (changes: Tag[]): Tag[] => {
		return changes.map(change => {
			const existing = tags.find(t => t.id === change.id)

			if (!existing) return change
			if (existing.updatedOn > change.updatedOn) return existing
			return change
		})
	}

	return {
		sync,
	}
}

export default useSync
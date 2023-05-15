import { Storage } from "@capacitor/storage";
import { getChangesFromDynamoDb } from "../utils/serverUtils";
import { Tag } from "../tags/tagModel";

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

export const sync = async () => {
	const changes: Tag[] = await getChangesFromDynamoDb<Tag>('Tag')
}
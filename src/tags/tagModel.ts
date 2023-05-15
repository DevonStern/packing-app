import { AtomEffect, DefaultValue, atom } from "recoil";
import { v4 as uuid } from "uuid";
import { makePersistenceEffect } from "../utils/persistenceUtils";
import { markDeletedInDynamoDb, putInDynamoDb } from "../utils/serverUtils";
import { CreatedUpdated, Sortable, WithId } from "../constants/modelConstants";
import { logChangesToServerData, logChangesToStoredData } from "../flags";
import { Storage } from "@capacitor/storage";

const STORAGE_KEY_TAGS = 'tags'
const TABLE_TAGS = 'Tag'

export interface Tag extends WithId, CreatedUpdated, Sortable {
	name: string
}

export const makeTag = (name: string, sortOrder: number): Tag => ({
	id: uuid(),
	name,
	createdOn: new Date(),
	updatedOn: new Date(),
	sortOrder,
})

export const parseTags = (tags: Partial<Tag>[]): Tag[] => {
	return tags.map<Tag>((tag, i) => ({
		id: tag.id!,
		name: tag.name!,
		createdOn: tag.createdOn ? new Date(tag.createdOn) : new Date(),
		updatedOn: tag.updatedOn ? new Date(tag.updatedOn) : new Date(),
		sortOrder: tag.sortOrder ?? i,
	}))
}

const tagsPersistenceInitEffect = (setSelf: (value: Promise<Tag[] | DefaultValue>) => void) => {
	setSelf(
		Storage.get({ key: STORAGE_KEY_TAGS })
			.then(({ value }) => {
				if (!value) return new DefaultValue()
				const restoredValue: Tag[] = parseTags(JSON.parse(value))
				if (logChangesToStoredData) console.log('restored from local storage', restoredValue)
				return restoredValue
			})
	)
}

const tagsServerInitEffect = (setSelf: (value: Promise<Tag[] | DefaultValue>) => void) => {
	// setSelf(

	// )
}

const tagsPersistenceOnSetEffect = (newValue: Tag[]) => {
	if (logChangesToStoredData) console.log('saving changes to state locally', newValue)
	Storage.set({ key: STORAGE_KEY_TAGS, value: JSON.stringify(newValue) })
}

const tagsServerOnSetEffect = (newValues: Tag[], oldValues: Tag[] | DefaultValue) => {
	if (oldValues instanceof DefaultValue) {
		console.debug('DefaultValue')
		//TODO: scan and see if any of the new values need to be uploaded (don't exist on server, were changed locally more recently, etc.)
		return
	}

	const changedOrAddedValues: Tag[] = newValues.filter(n => {
		const o = oldValues.find(possibleMatch => possibleMatch.id === n.id)
		const changedOrAdded: boolean = !o || JSON.stringify(o) !== JSON.stringify(n)
		return changedOrAdded
	})
	if (logChangesToServerData) console.log('saving changed or added values to server', changedOrAddedValues)
	changedOrAddedValues.forEach((value) => putInDynamoDb(TABLE_TAGS, value))

	const deletedValues = oldValues.filter(o => {
		const n = newValues.find(possibleMatch => possibleMatch.id === o.id)
		const deleted: boolean = !n
		return deleted
	})
	if (logChangesToServerData) console.log('saving deleted values to server', deletedValues)
	deletedValues.forEach((value) => markDeletedInDynamoDb(TABLE_TAGS, value))
}

/**
 * These effects need to be combined into a single effect so onSet doesn't get called
 * when setSelf gets called. That only works for the setSelf within the same effect.
 */
const tagsEffect: AtomEffect<Tag[]> = ({ setSelf, onSet }) => {
	tagsPersistenceInitEffect(setSelf)
	//TODO: init from server

	// onSet(tagsPersistenceOnSetEffect)
	// onSet(tagsServerOnSetEffect(getPromise))
}

export const tagsState = atom<Tag[]>({
	key: 'tagsState',
	default: [],
	effects: [
		tagsEffect, //Initialize from local storage first
		// makePersistenceEffect(STORAGE_KEY_TAGS, tagsRestorer), //Initialize from local storage first
	],
})
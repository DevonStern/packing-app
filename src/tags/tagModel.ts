import { AtomEffect, DefaultValue, RecoilValue, atom } from "recoil";
import { v4 as uuid } from "uuid";
import { makePersistenceEffect } from "../utils/persistenceUtils";
import { markDeletedInDynamoDb, putInDynamoDb } from "../utils/serverUtils";
import { CreatedUpdated, Deletable, Sortable, WithId } from "../constants/modelConstants";
import { logChangesToServerData, logChangesToStoredData } from "../flags";
import { Storage } from "@capacitor/storage";

const STORAGE_KEY_TAGS = 'tags'
export const TABLE_TAGS = 'Tag'

export interface BaseTag extends WithId {
	name: string
}

export interface Tag extends BaseTag, CreatedUpdated, Sortable {}

export const makeTag = (name: string, sortOrder: number): Tag => ({
	id: uuid(),
	name,
	createdOn: new Date(),
	updatedOn: new Date(),
	sortOrder,
})

// We have to be very specific in the parsers about what properties to include so we don't get unwanted properties
// (such as `serverUpdatedOn`).
export const parseTags = (tags: Partial<Tag>[]): Tag[] => {
	return tags.map<Tag>((tag, i) => ({
		id: tag.id!,
		name: tag.name!,
		createdOn: tag.createdOn ? new Date(tag.createdOn) : new Date(),
		updatedOn: tag.updatedOn ? new Date(tag.updatedOn) : new Date(),
		sortOrder: tag.sortOrder ?? i,
	}))
}

const RECORD_TYPE = 'tags'
const tagsPersistenceInitEffect = (setSelf: (value: Promise<Tag[] | DefaultValue>) => void) => {
	setSelf(
		Storage.get({ key: STORAGE_KEY_TAGS })
			.then(({ value }) => {
				if (!value) return new DefaultValue()
				const restoredValue: Tag[] = parseTags(JSON.parse(value))
				if (logChangesToStoredData) console.log(`restored ${RECORD_TYPE} from local storage`, restoredValue)
				return restoredValue
			})
	)
}

const tagsPersistenceOnSetEffect = (newValue: Tag[]) => {
	if (logChangesToStoredData) console.log(`saving changes to ${RECORD_TYPE} state locally`, newValue)
	Storage.set({ key: STORAGE_KEY_TAGS, value: JSON.stringify(newValue) })
}

export const fetchedTagsState = atom<(Tag & Deletable)[]>({
	key: 'fetchedTagsState',
	default: [],
})

const tagsServerOnSetEffect = (getPromise: <S>(recoilValue: RecoilValue<S>) => Promise<S>) => {
	return (newValues: Tag[], oldValues: Tag[] | DefaultValue) => {
		if (oldValues instanceof DefaultValue) {
			console.debug(`DefaultValue in ${RECORD_TYPE} server onSet effect`)
			//TODO: scan and see if any of the new values need to be uploaded (don't exist on server, were changed locally more recently, etc.)
			return
		}
			//TODO: fetch from server

		getPromise(fetchedTagsState).then(fetchedValues => {
			const changedOrAddedValues: Tag[] = newValues.filter(n => {
				const o = oldValues.find(possibleMatch => possibleMatch.id === n.id)
				const changedOrAdded: boolean = !o || JSON.stringify(o) !== JSON.stringify(n)
				return changedOrAdded
			})
			console.debug('before comparing changed to fetched', changedOrAddedValues)
			// Prevent sending to server when it was just fetched from server
			const differentFromServer = changedOrAddedValues.filter(newValue => {
				const fetched = fetchedValues.find(possibleMatch => possibleMatch.id === newValue.id)
				const differentFromServer: boolean = !fetched || JSON.stringify(fetched) !== JSON.stringify(newValue)
				return differentFromServer
			})
			if (logChangesToServerData) console.log('saving changed or added values to server', differentFromServer)
			differentFromServer.forEach((value) => putInDynamoDb(TABLE_TAGS, value))

			const deletedValues = oldValues.filter(o => {
				const n = newValues.find(possibleMatch => possibleMatch.id === o.id)
				const deleted: boolean = !n
				return deleted
			})
			console.debug('before comparing deleted to fetched', deletedValues)
			// Prevent sending to server when it was just fetched from server
			const notDeletedOnServer = deletedValues.filter(oldValue => {
				const fetched = fetchedValues.find(possibleMatch => possibleMatch.id === oldValue.id)
				const notDeletedOnServer: boolean = !fetched || !fetched.hasOwnProperty('deleted')
				return notDeletedOnServer
			})
			if (logChangesToServerData) console.log('saving deleted values to server', notDeletedOnServer)
			notDeletedOnServer.forEach((value) => markDeletedInDynamoDb(TABLE_TAGS, value))
		})
	}
}

/**
 * These effects need to be combined into a single effect so onSet doesn't get called
 * when setSelf gets called. That only works for the setSelf within the same effect.
 */
const tagsEffect: AtomEffect<Tag[]> = ({ setSelf, onSet, getPromise }) => {
	tagsPersistenceInitEffect(setSelf) //Initialize from local storage first - sync will come after

	onSet(tagsPersistenceOnSetEffect)
	onSet(tagsServerOnSetEffect(getPromise))
}

export const tagsState = atom<Tag[]>({
	key: 'tagsState',
	default: [],
	effects: [
		tagsEffect,
		// makePersistenceEffect(STORAGE_KEY_TAGS, tagsRestorer),
	],
})
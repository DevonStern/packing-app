import { AtomEffect, DefaultValue, RecoilValue, atom } from "recoil";
import { v4 as uuid } from "uuid";
import { makePersistenceEffect } from "../utils/persistenceUtils";
import { CreatedUpdated, Sortable, WithId } from "../constants/modelConstants";
import { Storage } from "@capacitor/storage";
import { logChangesToServerData, logChangesToStoredData } from "../flags";
import { markDeletedInDynamoDb, putInDynamoDb } from "../utils/serverUtils";

const STORAGE_KEY_PERSONS = 'persons'
const TABLE_PERSONS = 'Person'

export interface Person extends WithId, CreatedUpdated, Sortable {
	name: string
}

export const makePerson = (name: string, sortOrder: number): Person => ({
	id: uuid(),
	name,
	createdOn: new Date(),
	updatedOn: new Date(),
	sortOrder,
})

export const parsePersons = (persons: Partial<Person>[]): Person[] => {
	return persons.map<Person>((person, i) => ({
		id: person.id!,
		name: person.name!,
		createdOn: person.createdOn ? new Date(person.createdOn) : new Date(),
		updatedOn: person.updatedOn ? new Date(person.updatedOn) : new Date(),
		sortOrder: person.sortOrder ?? i,
	}))
}

const personsPersistenceInitEffect = (setSelf: (value: Promise<Person[] | DefaultValue>) => void) => {
	setSelf(
		Storage.get({ key: STORAGE_KEY_PERSONS })
			.then(({ value }) => {
				if (!value) return new DefaultValue()
				const restoredValue: Person[] = parsePersons(JSON.parse(value))
				if (logChangesToStoredData) console.log('restored from local storage', restoredValue)
				return restoredValue
			})
	)
}

const personsPersistenceOnSetEffect = (newValue: Person[]) => {
	if (logChangesToStoredData) console.log('saving changes to state locally', newValue)
	Storage.set({ key: STORAGE_KEY_PERSONS, value: JSON.stringify(newValue) })
}

export const fetchedPersonsState = atom<Person[]>({
	key: 'fetchedPersonsState',
	default: [],
})

const personsServerOnSetEffect = (getPromise: <S>(recoilValue: RecoilValue<S>) => Promise<S>) => {
	return (newValues: Person[], oldValues: Person[] | DefaultValue) => {
		if (oldValues instanceof DefaultValue) {
			console.debug('DefaultValue')
			//TODO: scan and see if any of the new values need to be uploaded (don't exist on server, were changed locally more recently, etc.)
			return
		}

		getPromise(fetchedPersonsState).then(fetchedValues => {
			const changedOrAddedValues: Person[] = newValues.filter(n => {
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
			differentFromServer.forEach((value) => putInDynamoDb(TABLE_PERSONS, value))

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
			notDeletedOnServer.forEach((value) => markDeletedInDynamoDb(TABLE_PERSONS, value))
		})
	}
}

/**
 * These effects need to be combined into a single effect so onSet doesn't get called
 * when setSelf gets called. That only works for the setSelf within the same effect.
 */
const personsEffect: AtomEffect<Person[]> = ({ setSelf, onSet, getPromise }) => {
	personsPersistenceInitEffect(setSelf) //Initialize from local storage first - sync will come after

	onSet(personsPersistenceOnSetEffect)
	onSet(personsServerOnSetEffect(getPromise))
}

export const personsState = atom<Person[]>({
	key: 'personsState',
	default: [],
	effects: [
		personsEffect,
		// makePersistenceEffect(STORAGE_KEY_PERSONS, personsRestorer),
	],
})
import { atom } from "recoil";
import { v4 as uuid } from "uuid";
import { makePersistenceEffect } from "../utils/persistenceUtils";

export interface Person {
	id: string
	name: string
}

export const makePerson = (name: string): Person => ({
	id: uuid(),
	name,
})

const STORAGE_KEY_PERSONS = 'persons'

const personsRestorer = (savedPersons: any): Person[] => {
	const persons: Person[] = savedPersons.map((person: Person) => {
		return person
	})
	return persons
}

export const personsState = atom<Person[]>({
	key: 'personsState',
	default: [],
	effects: [
		makePersistenceEffect(STORAGE_KEY_PERSONS, personsRestorer)
	],
})
import { atom } from "recoil";
import { v4 as uuid } from "uuid";
import { makePersistenceEffect } from "../utils/persistenceUtils";

export interface Tag {
	id: string
	name: string
}

export const makeTag = (name: string): Tag => ({
	id: uuid(),
	name,
})

const STORAGE_KEY_TAGS = 'tags'

const tagsRestorer = (savedTags: any): Tag[] => {
	const tags: Tag[] = savedTags.map((tag: Tag) => {
		return tag
	})
	return tags
}

export const tagsState = atom<Tag[]>({
	key: 'tagsState',
	default: [],
	effects: [
		makePersistenceEffect(STORAGE_KEY_TAGS, tagsRestorer)
	],
})
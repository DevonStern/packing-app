import { AtomEffect, DefaultValue, RecoilState, RecoilValueReadOnly, selector, selectorFamily } from "recoil"
import { Storage } from "@capacitor/storage";

export const makePersistenceEffect = <T>(
	storageKey: string,
	restorer: (savedState: any) => T,
): AtomEffect<T> => (
	({ setSelf, onSet }) => {
		Storage.get({ key: storageKey })
			.then(({ value }) => {
				if (!value) return
				setSelf(restorer(JSON.parse(value)))
			})

		onSet(newValue => {
			Storage.set({ key: storageKey, value: JSON.stringify(newValue) })
		})
	}
)

interface WithId {
	id: string,
}

export const makeObjectSelectorFamily = <T extends WithId>(
	stateKey: string,
	arrayState: RecoilState<T[]>,
) => {
	return selectorFamily<T, string>({
		key: stateKey,
		get: (id) => ({ get }) => {
			const currentValue: T | undefined = get(arrayState).find(value => value.id === id)
			if (!currentValue) {
				throw new Error("Where'd the thing go?")
			}
			return currentValue
		},
		set: (id) => ({ get, set }, updatedValue) => {
			if (updatedValue instanceof DefaultValue) {
				throw new Error("I don't know what the heck is going on.")
			}
			const currentValue: T | undefined = get(arrayState).find(value => value.id === id)
			if (!currentValue) {
				throw new Error("Where'd the thing go?")
			}
			const updatedValues: T[] = get(arrayState).map(value => {
				if (currentValue.id === value.id) {
					return updatedValue
				}
				return value
			})
			set(arrayState, updatedValues)
		},
	})
}
import { AtomEffect, DefaultValue, RecoilState, selector } from "recoil"
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

export const makeCurrentObjectSelector = <T extends WithId>(
	stateKey: string,
	arrayState: RecoilState<T[]>,
	currentIdState: RecoilState<string | undefined>,
) => {
	return selector<T>({
		key: stateKey,
		get: ({ get }) => {
			const id = get(currentIdState)
			if (!id) {
				throw new Error("Where's the ID?")
			}
			const currentValue: T | undefined = get(arrayState).find(value => value.id === id)
			if (!currentValue) {
				throw new Error("Where'd the thing go?")
			}
			return currentValue
		},
		set: ({ get, set }, updatedValue) => {
			const id = get(currentIdState)
			if (!id) {
				throw new Error("Where's the ID?")
			}
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
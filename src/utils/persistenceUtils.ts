import { AtomEffect } from "recoil"
import { Storage } from "@capacitor/storage";
import { logChangesToStoredData } from "../flags";

export const makePersistenceEffect = <T>(
	storageKey: string,
	restorer: (savedState: any) => T,
): AtomEffect<T> => (
	({ setSelf, onSet }) => {
		Storage.get({ key: storageKey })
			.then(({ value }) => {
				if (!value) return
				const restoredValue: T = restorer(JSON.parse(value))
				if (logChangesToStoredData) console.log('restored from local storage', restoredValue)
				setSelf(restoredValue)
			})

		onSet(newValue => {
			if (logChangesToStoredData) console.log('saving changes to state locally', newValue)
			Storage.set({ key: storageKey, value: JSON.stringify(newValue) })
		})
	}
)
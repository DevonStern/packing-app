import { Item } from "./itemModels";

const useItemUpdates = (isMasterList: boolean) => {
	const makeItemWithOverriddenPropIfNeeded = (
		item: Item,
		overridenPropKey: 'name' | 'persons' | 'state' | 'tags'
	): Item => {
		if (isMasterList) {
			return item
		}

		if (item.overriddenProps?.includes(overridenPropKey)) {
			return item
		} else {
			const updatedItem: Item = {
				...item,
				overriddenProps: [
					...(item.overriddenProps ?? []),
					overridenPropKey,
				]
			}
			return updatedItem
		}
	}

	return {
		makeItemWithOverriddenPropIfNeeded,
	}
}

export default useItemUpdates

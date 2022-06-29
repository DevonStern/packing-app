import { List } from "../lists/listModels";
import { Item } from "./itemModels";

const useItemUpdates = () => {
	const getItemWithOverriddenPropIfNeeded = (
		list: List,
		item: Item,
		overridenPropKey: 'name' | 'persons' | 'state' | 'tags'
	): Item => {
		if (list.isMaster) {
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
		getItemWithOverriddenPropIfNeeded,
	}
}

export default useItemUpdates

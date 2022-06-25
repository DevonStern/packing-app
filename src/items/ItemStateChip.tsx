import { IonChip } from "@ionic/react"
import { Item } from "./itemModel"
import useItemInfo from "./useItemInfo"

interface ItemStateChipProps {
	item: Item
}

const ItemStateChip: React.FC<ItemStateChipProps> = ({ item }) => {
	const { isItemFullyLoaded, stateText } = useItemInfo(item)
	
	return (
		<IonChip
			color={isItemFullyLoaded ? 'success' : 'secondary'}
			outline={!isItemFullyLoaded}
		>
			{stateText}
		</IonChip>
	)
}

export default ItemStateChip
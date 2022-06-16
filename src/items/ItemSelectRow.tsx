import { CheckboxChangeEventDetail, IonCheckboxCustomEvent } from "@ionic/core"
import { IonCheckbox, IonItem, IonLabel } from "@ionic/react"
import { Item } from "./ItemModel"

interface ItemSelectRowProps {
	item: Item
	selectedItems: Item[]
	setSelectedItems: React.Dispatch<React.SetStateAction<Item[]>>
}

const ItemSelectRow: React.FC<ItemSelectRowProps> = ({ item, selectedItems, setSelectedItems }) => {
	const isInSelectedItems: boolean = selectedItems.find(i => i.id === item.id) !== undefined

	const handleChange = (event: IonCheckboxCustomEvent<CheckboxChangeEventDetail<Item>>) => {
		if (event.detail.checked) {
			const updatedSelectedItems: Item[] = [...selectedItems, item]
			setSelectedItems(updatedSelectedItems)
		} else {
			const updatedSelectedItems: Item[] = selectedItems.filter(i => i.id !== item.id)
			setSelectedItems(updatedSelectedItems)
		}
	}

	return (
		<IonItem>
			<IonCheckbox
				slot="start"
				checked={isInSelectedItems}
				onIonChange={handleChange}
			/>
			<IonLabel>{item.name}</IonLabel>
		</IonItem>
	)
}

export default ItemSelectRow
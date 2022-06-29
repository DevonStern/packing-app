import { IonItem, IonLabel, IonList } from "@ionic/react"
import { useRecoilValue } from "recoil"
import useItemInfo from "./useItemInfo"
import { List } from "../lists/listModels"
import { personsState } from "../persons/personModel"
import PersonSelect from "../persons/PersonSelect"
import { Item } from "./itemModels"
import ItemPersonRow from "./ItemPersonRow"
import MoveItemStateButton from "./MoveItemStateButton"
import useItemState from "./useItemState"
import ItemStateChip from "./ItemStateChip"

interface ItemViewProps {
	list: List
	item: Item
}

const ItemView: React.FC<ItemViewProps> = ({ list, item }) => {
	const persons = useRecoilValue(personsState)

	const { hasPersons, lowestItemState, stateText } = useItemInfo(item)
	const { moveWholeState } = useItemState(list, item)

	return (
		<>
			<IonList>
				{persons.length > 0 ? (
					<IonItem>
						<IonLabel>People</IonLabel>
						<PersonSelect list={list} selectedItems={[item]} />
					</IonItem>
				) : null}
				{hasPersons ? (
					<>
						<IonItem>
							<IonList style={{ width: '100%' }}>
								{item.persons.map((itemPerson) => (
									<ItemPersonRow
										key={itemPerson.person.id}
										list={list}
										item={item}
										itemPerson={itemPerson}
									/>
								))}
							</IonList>
						</IonItem>
						<IonItem>
							<IonLabel>Overall:</IonLabel>
							<ItemStateChip item={item} />
						</IonItem>
					</>
				) : (
					<IonItem>{stateText}</IonItem>
				)}
			</IonList>
			<MoveItemStateButton
				expand="block"
				state={lowestItemState}
				onClick={moveWholeState}
			/>
		</>
	)
}

export default ItemView
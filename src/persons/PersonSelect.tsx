import { IonSelectCustomEvent, SelectChangeEventDetail } from "@ionic/core"
import { IonSelect, IonSelectOption } from "@ionic/react"
import { useRecoilState, useRecoilValue } from "recoil"
import { currentItemState, Item } from "../items/ItemModel"
import { Person, personsState } from "./PersonModel"

const PersonSelect: React.FC = () => {
	const [item, setItem] = useRecoilState(currentItemState)
	const persons = useRecoilValue(personsState)

	const comparePersons = (o1: Person, o2: Person) => {
		return o1 && o2 ? o1.id === o2.id : o1 === o2
	}

	const updateItemPersons = (event: IonSelectCustomEvent<SelectChangeEventDetail<Person[]>>) => {
		const updatedPersons: Person[] = event.detail.value
		const updatedItem: Item = {
			...item,
			persons: updatedPersons
		}
		setItem(updatedItem)
	}

	return (
		<>
			<IonSelect multiple compareWith={comparePersons} value={item.persons} onIonChange={updateItemPersons}>
				{persons.map(person => (
					<IonSelectOption key={person.id} value={person}>
						{person.name}
					</IonSelectOption>
				))}
			</IonSelect>
		</>
	)
}

export default PersonSelect
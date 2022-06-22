import { IonFab, IonFabButton, IonFabList, IonIcon } from "@ionic/react"
import { bagCheck, ellipsisVertical, person, pricetag } from "ionicons/icons"
import { useRecoilState } from "recoil"
import { selectedItemsState } from "../state/state"

const MultiSelectActions: React.FC = () => {
	const [selectedItems, setSelectedItems] = useRecoilState(selectedItemsState)

	const personHandler = () => {

	}

	const tagHandler = () => {

	}

	const itemStateHandler = () => {

	}

	return (
		<IonFab horizontal="end" vertical="bottom" slot="fixed">
			<IonFabButton color="secondary">
				<IonIcon icon={ellipsisVertical} />
			</IonFabButton>
			<IonFabList side="top">
				<IonFabButton onClick={personHandler}>
					<IonIcon icon={person} />
				</IonFabButton>
				<IonFabButton onClick={tagHandler}>
					<IonIcon icon={pricetag} />
				</IonFabButton>
				<IonFabButton onClick={itemStateHandler}>
					<IonIcon icon={bagCheck} />
				</IonFabButton>
			</IonFabList>
		</IonFab>
	)
}

export default MultiSelectActions
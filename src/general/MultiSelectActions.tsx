import { IonFab, IonFabButton, IonFabList, IonIcon } from "@ionic/react"
import { bagCheck, ellipsisVertical, person, pricetag } from "ionicons/icons"
import { useEffect, useState } from "react"
import { useRecoilValue } from "recoil"
import { List } from "../lists/listModel"
import PersonSelectForMultipleItems from "../persons/PersonSelectForMultipleItems"
import { selectedItemsState } from "../state/state"

interface MultiSelectActionsProps {
	list: List
}

const MultiSelectActions: React.FC<MultiSelectActionsProps> = ({ list }) => {
	const selectedItems = useRecoilValue(selectedItemsState)

	const [openPersonSelect, setOpenPersonSelect] = useState<boolean>(false)

	useEffect(() => {
		setOpenPersonSelect(false)
	}, [openPersonSelect])

	const personHandler = () => {
		setOpenPersonSelect(true)
	}

	const tagHandler = () => {

	}

	const itemStateHandler = () => {

	}

	return (
		<>
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
			<div style={{display: 'none'}}>
				<PersonSelectForMultipleItems list={list} selectedItems={selectedItems} openSelect={openPersonSelect} />
			</div>
		</>
	)
}

export default MultiSelectActions
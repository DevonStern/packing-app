import { IonFab, IonFabButton, IonFabList, IonIcon } from "@ionic/react"
import { bagCheck, ellipsisVertical, person, pricetag } from "ionicons/icons"
import { useEffect, useState } from "react"
import { useRecoilValue } from "recoil"
import ItemStateSelect from "../items/ItemStateSelect"
import { List } from "../lists/listModel"
import PersonSelect from "../persons/PersonSelect"
import { selectedItemsState } from "../state/state"

interface MultiSelectActionsProps {
	list: List
}

const MultiSelectActions: React.FC<MultiSelectActionsProps> = ({ list }) => {
	const selectedItems = useRecoilValue(selectedItemsState)

	const [openPersonSelect, setOpenPersonSelect] = useState<boolean>(false)
	const [openItemStateSelect, setOpenItemStateSelect] = useState<boolean>(false)

	useEffect(() => {
		setOpenPersonSelect(false)
	}, [openPersonSelect])
	useEffect(() => {
		setOpenItemStateSelect(false)
	}, [openItemStateSelect])

	const personHandler = () => {
		setOpenPersonSelect(true)
	}
	const tagHandler = () => {

	}
	const itemStateHandler = () => {
		setOpenItemStateSelect(true)
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
			<div style={{ display: 'none' }}>
				<PersonSelect list={list} selectedItems={selectedItems} openSelect={openPersonSelect} />
				<ItemStateSelect list={list} selectedItems={selectedItems} openSelect={openItemStateSelect} />
			</div>
		</>
	)
}

export default MultiSelectActions
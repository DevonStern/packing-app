import { IonButton } from "@ionic/react"
import { getNextItemState, isLastItemState } from "../utils/itemStateUtils"
import { ItemState } from "./itemModel"


interface MoveItemStateButtonProps {
	expand?: "block" | "full"
	state: ItemState
	onClick: () => void
}

const MoveItemStateButton: React.FC<MoveItemStateButtonProps> = ({ expand, state, onClick }) => {
	const isLastState: boolean = isLastItemState(state)
	const nextState: ItemState = getNextItemState(state)

	return (
		<IonButton expand={expand} disabled={isLastState} onClick={onClick}>
			{!isLastState ? ItemState[nextState] : 'Ready'}
		</IonButton>
	)
}

export default MoveItemStateButton
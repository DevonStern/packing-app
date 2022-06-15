import { IonButton } from "@ionic/react"
import { getNextItemState, isLastItemState } from "../utils/utils"
import { ItemState } from "./ItemModel"


interface MoveItemStateButtonProps {
	state: ItemState
	onClick: () => void
	expand?: "block" | "full"
}

const MoveItemStateButton: React.FC<MoveItemStateButtonProps> = ({ state, onClick, expand }) => {
	const isLastState: boolean = isLastItemState(state)
	const nextState: ItemState = getNextItemState(state)

	return (
		<IonButton expand={expand} disabled={isLastState} onClick={onClick}>
			{!isLastState ? ItemState[nextState] : 'Ready'}
		</IonButton>
	)
}

export default MoveItemStateButton
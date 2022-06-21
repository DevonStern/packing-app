import { IonFab, IonFabButton, IonIcon } from "@ionic/react"
import { add } from "ionicons/icons"

interface FabProps {
	onClick: () => void
}

const Fab: React.FC<FabProps> = ({ onClick }) => {
	return (
		<IonFab horizontal="center" vertical="bottom" slot="fixed">
			<IonFabButton onClick={onClick}>
				<IonIcon icon={add} size="large" />
			</IonFabButton>
		</IonFab>
	)
}

export default Fab
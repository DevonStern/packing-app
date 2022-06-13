import { Storage } from "@capacitor/storage";
import { IonButton } from "@ionic/react"

const ClearStorageButton: React.FC = () => {
	return (
		<IonButton color="danger" onClick={() => Storage.clear()}>Clear storage</IonButton>
	)
}

export default ClearStorageButton
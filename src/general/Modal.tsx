import { IonButton, IonContent, IonFooter, IonModal, IonToolbar } from "@ionic/react"
import { PropsWithChildren } from "react"

interface ModalProps {
	isOpen: boolean
	setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const Modal: React.FC<PropsWithChildren<ModalProps>> = ({ children, isOpen, setIsOpen }) => {
	return (
		<IonModal
			isOpen={isOpen}
		>
			<IonContent>
				{children}
			</IonContent>
			<IonFooter>
				<IonToolbar>
					<IonButton expand="block" onClick={() => setIsOpen(false)}>Close</IonButton>
				</IonToolbar>
			</IonFooter>
		</IonModal>
	)
}

export default Modal
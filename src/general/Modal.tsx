import { IonButton, IonModal } from "@ionic/react"
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
			{children}
			<IonButton onClick={() => setIsOpen(false)}>Close</IonButton>
		</IonModal>
	)
}

export default Modal
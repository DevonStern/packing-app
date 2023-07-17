import { IonRouterLink } from "@ionic/react"

const ErrorPage: React.FC = () => {
	return (
		<>
			Error<br />
			<IonRouterLink href="/">Return to app</IonRouterLink>
		</>
	)
}

export default ErrorPage
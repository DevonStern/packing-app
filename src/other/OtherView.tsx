import { IonItem, IonList } from "@ionic/react"
import { useHistory } from "react-router-dom"

const OtherView: React.FC = () => {
	const history = useHistory()

	const goToPage = (page: string) => {
		history.push(`/other/${page}`)
	}

	return (
		<IonList>
			<IonItem onClick={() => goToPage('person')}>People</IonItem>
			<IonItem onClick={() => goToPage('tag')}>Tags</IonItem>
		</IonList>
	)
}

export default OtherView
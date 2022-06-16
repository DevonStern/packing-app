import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import PersonsView from './PersonsView';

const PersonsPage: React.FC = () => {
	return (
		<IonPage>
			<IonHeader>
				<IonToolbar>
					<IonTitle>People</IonTitle>
				</IonToolbar>
			</IonHeader>
			<IonContent fullscreen>
				<IonHeader collapse="condense">
					<IonToolbar>
						<IonTitle size="large">People</IonTitle>
					</IonToolbar>
				</IonHeader>
				<PersonsView />
			</IonContent>
		</IonPage>
	)
}

export default PersonsPage
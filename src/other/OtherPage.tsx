import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import OtherView from './OtherView';

const OtherPage: React.FC = () => {
	return (
		<IonPage>
			<IonHeader>
				<IonToolbar>
					<IonTitle>Other</IonTitle>
				</IonToolbar>
			</IonHeader>
			<IonContent fullscreen>
				<IonHeader collapse="condense">
					<IonToolbar>
						<IonTitle size="large">Other</IonTitle>
					</IonToolbar>
				</IonHeader>
				<OtherView />
			</IonContent>
		</IonPage>
	)
}

export default OtherPage
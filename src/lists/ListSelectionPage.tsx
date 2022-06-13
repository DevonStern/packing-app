import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import ListSelectionView from './ListSelectionView';

const ListSelectionPage: React.FC = () => {
	return (
		<IonPage>
			<IonHeader>
				<IonToolbar>
					<IonTitle>Trips</IonTitle>
				</IonToolbar>
			</IonHeader>
			<IonContent fullscreen>
				<IonHeader collapse="condense">
					<IonToolbar>
						<IonTitle size="large">Trips</IonTitle>
					</IonToolbar>
				</IonHeader>
				<ListSelectionView />
			</IonContent>
		</IonPage>
	)
}

export default ListSelectionPage
import { IonBackButton, IonButtons, IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import TagsView from './TagsView';

const TagsPage: React.FC = () => {
	return (
		<IonPage>
			<IonHeader>
				<IonToolbar>
					<IonButtons slot="start">
						<IonBackButton />
					</IonButtons>
					<IonTitle>Tags</IonTitle>
				</IonToolbar>
			</IonHeader>
			<IonContent fullscreen>
				<IonHeader collapse="condense">
					<IonToolbar>
						<IonButtons slot="start">
							<IonBackButton />
						</IonButtons>
						<IonTitle size="large">Tags</IonTitle>
					</IonToolbar>
				</IonHeader>
				<TagsView />
			</IonContent>
		</IonPage>
	)
}

export default TagsPage
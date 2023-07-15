import { IonButton, IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import OtherView from './OtherView';
import useSync from '../sync/useSync';
import { useSetRecoilState } from 'recoil';
import { listsState } from '../lists/listModels';

const OtherPage: React.FC = () => {
	const { sync } = useSync()

	const setValues = useSetRecoilState(listsState)
	const initialSave = () => {
		setValues(oldValues => oldValues.map(list => ({
			...list,
			items: list.items.map(item => ({
				...item,
				updatedOn: new Date(),
			}))
		})))
	}

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
				<IonButton onClick={sync}>Sync</IonButton>
				<IonButton onClick={initialSave}>ITEMS Initial Save and Upload</IonButton>
				<OtherView />
			</IonContent>
		</IonPage>
	)
}

export default OtherPage
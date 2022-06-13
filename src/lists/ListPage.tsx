import { IonBackButton, IonButtons, IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { useRecoilValue } from 'recoil';
import { currentListState } from './ListModel';
import ListView from './ListView';

const ListPage: React.FC = () => {

	return (
		<IonPage>
			<Header isMain={true} />
			<IonContent fullscreen>
				<Header isMain={false} />
				<ListView />
			</IonContent>
		</IonPage>
	)
}

export default ListPage



interface HeaderProps {
	isMain: boolean
}

const Header: React.FC<HeaderProps> = ({ isMain }) => {
	const list = useRecoilValue(currentListState)

	const title: string = `${list.name} Packing List`

	return (
		<IonHeader collapse={isMain ? undefined : 'condense'}>
			<IonToolbar>
				<IonButtons slot="start">
					<IonBackButton />
				</IonButtons>
				<IonTitle size={isMain ? undefined : 'large'}>{title}</IonTitle>
			</IonToolbar>
		</IonHeader>
	)
}
import { IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { checkbox, checkboxOutline } from 'ionicons/icons';
import { RouteComponentProps } from 'react-router-dom';
import { useRecoilState, useRecoilValue } from 'recoil';
import { multiSelectState } from '../state/state';
import { List, listsState } from './listModels';
import ListView from './ListView';

interface ListPageProps extends RouteComponentProps<{
	listId: string
}> {
}

const ListPage: React.FC<ListPageProps> = ({ match: { params: { listId } } }) => {
	const lists = useRecoilValue(listsState)

	const list: List | undefined = lists.find(l => l.id === listId)
	if (!list) {
		console.error(`Invalid listId param in route: ${listId}`)
		return <>Error</>
	}

	return (
		<IonPage>
			<Header list={list} isMain={true} />
			<IonContent fullscreen>
				<Header list={list} isMain={false} />
				<ListView list={list} />
			</IonContent>
		</IonPage>
	)
}

export default ListPage



interface HeaderProps {
	list: List
	isMain: boolean
}

const Header: React.FC<HeaderProps> = ({ list, isMain }) => {
	const [isMultiSelectMode, setIsMultiSelectMode] = useRecoilState(multiSelectState)

	const title: string = `${list.name} Packing List`

	return (
		<IonHeader collapse={isMain ? undefined : 'condense'}>
			<IonToolbar>
				<IonButtons slot="start">
					<IonBackButton />
				</IonButtons>
				<IonTitle size={isMain ? undefined : 'large'}>{title}</IonTitle>
				<IonButtons slot="end">
					{isMultiSelectMode ?
						<IonButton onClick={() => setIsMultiSelectMode(false)}>
							<IonIcon icon={checkbox} size="large" />
						</IonButton>
					:
						<IonButton onClick={() => setIsMultiSelectMode(true)}>
							<IonIcon icon={checkboxOutline} size="large" />
						</IonButton>
					}
				</IonButtons>
			</IonToolbar>
		</IonHeader>
	)
}
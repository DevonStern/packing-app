import { IonBackButton, IonButtons, IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { RouteComponentProps } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { List, listsState } from './listModel';
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
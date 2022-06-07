import { Storage } from '@capacitor/storage';
import { IonButton, IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonList, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { add } from 'ionicons/icons';
import { useState } from 'react';
import { useRecoilValue } from 'recoil';
import AddItemInput from '../items/AddItemInput';
import { Item } from '../items/ItemModel';
import ItemRow from '../items/ItemRow';
import { currentListState } from './ListModel';

const ListPage: React.FC = () => {
	const currentList = useRecoilValue(currentListState)
	console.log(currentList)

	const [isAddItemInputOpen, setIsAddItemInputOpen] = useState<boolean>(false)

	// const clearStorage = () => {
	// 	Storage.clear()
	// }
	
	return (
		<IonPage>
			<IonHeader>
				<IonToolbar>
					<IonTitle>Tab 1</IonTitle>
				</IonToolbar>
			</IonHeader>
			<IonContent fullscreen>
				<IonHeader collapse="condense">
					<IonToolbar>
						<IonTitle size="large">Tab 1</IonTitle>
					</IonToolbar>
				</IonHeader>
				<IonList>
					{currentList.items.map((item, index) => {
						return <ItemRow key={'item-' + index} item={item} />
					})}
				</IonList>
				{/* <IonButton onClick={clearStorage}>Clear storage</IonButton> */}
				<IonFab horizontal="center" vertical="bottom" style={{ paddingBottom: '60px' }}>
					<IonFabButton onClick={() => setIsAddItemInputOpen(true)}>
						<IonIcon icon={add} size="large" />
					</IonFabButton>
				</IonFab>
				<AddItemInput isOpen={isAddItemInputOpen} setIsOpen={setIsAddItemInputOpen} />
			</IonContent>
		</IonPage>
	)
}

export default ListPage
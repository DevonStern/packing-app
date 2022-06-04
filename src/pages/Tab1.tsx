import { useRecoilValue } from 'recoil';
import { currentItemIdState } from '../items/ItemModel';
import ItemPage from '../items/ItemPage';
import ListPage from '../lists/ListPage';
import './Tab1.css';

const Tab1: React.FC = () => {
	const currentItemId = useRecoilValue(currentItemIdState)

	return (
		<>
			{!currentItemId ?
				<ListPage />
				:
				<ItemPage />
			}
		</>
	)
}

export default Tab1

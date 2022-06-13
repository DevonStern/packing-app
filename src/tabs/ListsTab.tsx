import { Route } from 'react-router';
import ItemPage from '../items/ItemPage';
import ListPage from '../lists/ListPage';
import ListSelectionPage from '../lists/ListSelectionPage';
import './ListsTab.css';

const ListsTab: React.FC = () => {
	return (
		<>
			<Route exact path="/:tab(list)" component={ListSelectionPage} />
			<Route exact path="/:tab(list)/:listId" component={ListPage} />
			<Route exact path="/:tab(list)/:listId/item/:itemId" component={ItemPage} />
		</>
	)
}

export default ListsTab

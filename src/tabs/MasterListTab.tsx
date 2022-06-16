import { Route } from 'react-router';
import MasterListPage from '../lists/MasterListPage';
import './MasterListTab.css';

const MasterListTab: React.FC = () => {
	return (
		<Route exact path="/:tab(masterList)" component={MasterListPage} />
	)
}

export default MasterListTab

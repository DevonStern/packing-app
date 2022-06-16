import { Route } from 'react-router';
import PersonsPage from '../persons/PersonsPage';
import './PersonsTab.css';

const PersonsTab: React.FC = () => {
	return (
		<Route exact path="/:tab(person)" component={PersonsPage} />
	)
}

export default PersonsTab

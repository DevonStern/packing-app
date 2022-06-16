import { Redirect, Route } from 'react-router-dom';
import {
	IonApp,
	IonIcon,
	IonLabel,
	IonRouterOutlet,
	IonTabBar,
	IonTabButton,
	IonTabs,
	setupIonicReact
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { ellipse, person, square, triangle } from 'ionicons/icons';
import MasterListTab from './tabs/MasterListTab';
import ListsTab from './tabs/ListsTab';
import PersonsTab from './tabs/PersonsTab';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';

setupIonicReact();

const App: React.FC = () => (
	<IonApp>
		<IonReactRouter>
			<IonTabs>
				<IonRouterOutlet>
					<MasterListTab />
					<ListsTab />
					<PersonsTab />
					<Route exact path="/">
						<Redirect to="/list" />
					</Route>
				</IonRouterOutlet>
				<IonTabBar slot="bottom">
					<IonTabButton tab="masterList" href="/masterList">
						<IonIcon icon={triangle} />
						<IonLabel>Master List</IonLabel>
					</IonTabButton>
					<IonTabButton tab="list" href="/list">
						<IonIcon icon={ellipse} />
						<IonLabel>Lists</IonLabel>
					</IonTabButton>
					<IonTabButton tab="person" href="/person">
						<IonIcon icon={person} />
						<IonLabel>People</IonLabel>
					</IonTabButton>
				</IonTabBar>
			</IonTabs>
		</IonReactRouter>
	</IonApp>
)

export default App
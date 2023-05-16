import { useInterval } from '../utils/useInterval';
import useSync from './useSync';
import { App, AppState } from '@capacitor/app';

const usePollForChanges = () => {
	const { sync } = useSync()

	const syncInterval = 30000
	useInterval(() => {
		sync();
	}, syncInterval);

	App.addListener('appStateChange', (state: AppState) => {
		if (state.isActive) {
			sync()
		}
	})
}

export default usePollForChanges;
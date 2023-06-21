import { syncInterval, syncOnAppActive } from '../flags';
import { useInterval } from '../utils/useInterval';
import useSync from './useSync';
import { App, AppState } from '@capacitor/app';

const usePollForChanges = () => {
	const { sync } = useSync()

	useInterval(() => {
		sync();
	}, syncInterval);

	if (syncOnAppActive) {
		App.addListener('appStateChange', (state: AppState) => {
			if (state.isActive) {
				sync()
			}
		})
	}
}

export default usePollForChanges;
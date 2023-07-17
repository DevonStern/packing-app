import { useEffect } from 'react';
import { syncInterval, syncOnAppActive } from '../flags';
import { useInterval } from '../utils/useInterval';
import useSync from './useSync';
import { App, AppState } from '@capacitor/app';

const usePollForChanges = () => {
	const { sync } = useSync()

	useInterval(() => {
		sync();
	}, syncInterval);

	useEffect(() => {
		if (syncOnAppActive) {
			const listener = App.addListener('appStateChange', (state: AppState) => {
				if (state.isActive) {
					sync()
				}
			})
			return () => {
				listener.remove()
			}
		}
	}, [syncOnAppActive])
}

export default usePollForChanges;
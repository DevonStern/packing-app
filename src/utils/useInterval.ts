import { App, AppState } from '@capacitor/app';
import { useEffect, useRef, useState } from 'react';

// This is originally from "Oh Danny Boy" Abramov's blog post (adapted for TypeScript): https://overreacted.io/making-setinterval-declarative-with-react-hooks/
export const useInterval = (callback: (...args: any[]) => void, delay: number, runInBackground?: boolean) => {
	const [isAppInBackground, setIsAppInBackground] = useState<boolean>(false);
	const savedCallback = useRef<(...args: any[]) => void>(callback);

	// Remember the latest callback.
	useEffect(() => {
		savedCallback.current = callback;
	}, [callback]);

	// Set up the interval.
	useEffect(() => {
		if (isAppInBackground && !runInBackground) return;

		function execute() {
			savedCallback.current();
		}
		const id = setInterval(execute, delay);
		return () => clearInterval(id);
	}, [delay, isAppInBackground]);

	useEffect(() => {
		if (!runInBackground) {
			App.addListener('appStateChange', (state: AppState) => {
				setIsAppInBackground(!state.isActive);
			});
		}
	}, [runInBackground, setIsAppInBackground])
};
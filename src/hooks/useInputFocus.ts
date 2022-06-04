import { useEffect } from "react"

const useInputFocus = (inputRef: React.MutableRefObject<HTMLIonInputElement | null> | React.MutableRefObject<HTMLIonTextareaElement | null>) => {
	useEffect(() => {
		const internalInputChecker = setInterval(() => {
			// We need to make sure the internal `input` element is initialized before trying to focus on it
			inputRef.current?.getInputElement()
				.then((element: any) => {
					if (element) {
						inputRef.current?.setFocus()
						clearInterval(internalInputChecker)
					}
				})
		}, 50)
		return () => {
			clearInterval(internalInputChecker)
		}
	}, [])
}

export default useInputFocus
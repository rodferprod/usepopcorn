import { useEffect } from "react";

export function useKeyPress(key, action) {
	// This function will initialise a listener to check if the Esc key
	// was pressed, so we'll close the movie detail section.
	useEffect(() => {
		const escToCloseDetails = (ev) => {
			if (ev.code.toLowerCase() === key.toLowerCase()) {
				action();
			}
		};

		document.addEventListener("keydown", escToCloseDetails);

		// With this cleanup function we're ensure that each event listener
		// will be removed after bein created on component re-renders.
		return () => document.removeEventListener("keydown", escToCloseDetails);
	}, [action, key]);
}

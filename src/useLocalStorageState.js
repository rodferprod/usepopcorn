import { useState, useEffect } from "react";

export function useLocalStorageState(initialState, key) {
	// As we're storing the watched movie list on the browser using localStorage, then
	// we now could load the watched list from localStorage and initialize our state
	// based on a callback function that loads the stored list only on initial render.
	//--> const [watched, setWatched] = useState([]);
	const [value, setValue] = useState(
		// To initialize an state with a callback function it needs to be:
		// 1) A pure function;
		// 2) Without parameters.
		() => {
			const storedWatchedMovieList = localStorage.getItem(key);
			return storedWatchedMovieList
				? JSON.parse(storedWatchedMovieList)
				: initialState;
		}
	);

	// An effect that will sync our state with the stored list wherever it changes.
	useEffect(() => {
		localStorage.setItem(key, JSON.stringify(value));
	}, [value, key]);

	return [value, setValue];
}

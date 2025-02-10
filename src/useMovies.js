import { useState, useEffect } from "react";

const APIKEY = "YOR_API_KEY";

export function useMovies(query) {
	// , callBack
	const [movies, setMovies] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");

	// This function will load the initial movies from the API each time
	// we access the web app. Then, when we search for another movie
	// it will be triggered again as we're informing "query" as dependency.
	useEffect(() => {
		// Run the callback function if it exists
		// callBack?.();

		// Here we're creating a way to abort requests each time another
		// requst is fired to prevent a race condition between them.
		const abortController = new AbortController();

		async function fetchMovies() {
			setError("");
			setIsLoading(true);
			try {
				const res = await fetch(
					`http://www.omdbapi.com/?apikey=${APIKEY}&s=${query}`,
					// Attatching the abortController to the request
					{ signal: abortController.signal }
				);

				if (!res.ok) {
					throw new Error(
						`Something went wrong with fetching movies: ${res.statusText}`
					);
				}

				const data = await res.json();

				if (data.Response === "False") {
					throw new Error(data.Error);
				}

				setMovies(data.Search);
			} catch (err) {
				if (err.name === "Error") {
					setError(err.message);
				}
			} finally {
				setIsLoading(false);
			}
		}

		if (query.length < 3) {
			setMovies([]);
			setError("");
			return;
		}

		fetchMovies();

		// Executing a cleanup effect to abort every request maded
		// before another new one has maded on each re-render.
		return () => abortController.abort();
	}, [query]);

	return { movies, isLoading, error };
}

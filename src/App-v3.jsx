import { useEffect, useRef, useState } from "react";
import StarRating from "./StarRating";
import { useMovies } from "./useMovies";
import { useLocalStorageState } from "./useLocalStorageState";

const APIKEY = "YOR_API_KEY";

const average = (arr) =>
    arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

export default function App() {
    const [query, setQuery] = useState("");
    const [selectedId, setSelectedId] = useState(null);
    // A custom hook to load movies that acepts a term to be searched (query) and
    // a callback function that will be executed inside the custom hook.
    // OBS: This callback function NEED to be a regular function (hoisted).
    //      If it's declared as an arrow function it will not work properly.
    const { movies, isLoading, error } = useMovies(query); // , handleCloseSelectedMovie

    // A custom hook to store and update our watched movie list on localStorage
    const [watched, setWatched] = useLocalStorageState([], 'watched');

    function handleSelectMovie(id) {
        setSelectedId((selectedId) => (selectedId === id ? null : id));
    }

    function handleCloseSelectedMovie() {
        setSelectedId(null);
    }

    function handleAddWatched(movie) {
        setWatched((watched) => [...watched, movie]);
        // We could store de watched list here, but we would need to create another
        // statement when we delete a movie from the list. So, to be more effective
        // we'll create a effect that will be in sync with our watched state.
        //--> localStorage.setItem('watched', JSON.stringify([...watched, movie]));
    }

    function handleDeleteWatched(id) {
        setWatched((watched) => watched.filter(movie => movie.imdbID !== id));
        // As we already knows, using an effect we can sync our state with the stored list wherever it changes.
        //--> localStorage.setItem('watched', JSON.stringify(watched.filter(movie => movie.imdbID !== id)));
    }

    return (
        <>
            <NavBar>
                <Logo />
                <Search query={query} setQuery={setQuery} />
                <NumResults movies={movies} />
            </NavBar>
            <Main>
                <Box>
                    {isLoading && <Loader />}
                    {!isLoading && error && <ShowError message={error} />}
                    {!isLoading && !error && (
                        <MovieList
                            onSelectMovie={handleSelectMovie}
                            movies={movies}
                        />
                    )}
                </Box>
                <Box>
                    {selectedId ? (
                        <MovieDetails
                            selectedId={selectedId}
                            onCloseMovie={handleCloseSelectedMovie}
                            onAddWatched={handleAddWatched}
                            watched={watched}
                        />
                    ) : (
                        <>
                            <WatchedSummary watched={watched} />
                            <WatchedMoviesList watched={watched} onDeleteWatched={handleDeleteWatched} />
                        </>
                    )}
                </Box>
            </Main>
        </>
    );
}

function ShowError({ message }) {
    return (
        <p className="error">
            <span>🛑</span> {message}
        </p>
    );
}

function Loader() {
    return <p className="loader">Loading...</p>;
}

function Logo() {
    return (
        <div className="logo">
            <span role="img">🍿</span>
            <h1>usePopcorn</h1>
        </div>
    );
}

function Search({ query, setQuery }) {
    //  1)  Here we'll attach our search input field as a reference into a variable.
    //      So, we can manupulate it as we need to apply a focus on it when the component
    //      is rendered and each time we press the enter key. We also need to clean the
    //      textfield after that.
    // OBS: useRef variables is used just behind the scenes
    // of an React application and it's value is not used to be
    // rendered with any component.

    const inputElem = useRef(null);

    useEffect(() => {

        const focusInputFieldOnEnter = (ev) => {

            // We want to clean our inputfield when we press the enter key, but
            // only when the active DOM element isn't our inputfield, because
            // if we search for a term and just press enter key trying to 
            // request data we'll just clean the textfield and focus it again.
            // So, if the active element is our inoutfield we'll cancel the action.
            if (document.activeElement === inputElem.current) {
                return;
            }

            if (ev.code === 'Enter' || ev.code === 'NumpadEnter') {
                //  3) As the reference is applied after the component renders
                //       we can access it using the "current" property just
                //      inside an useEffect hook.
                inputElem.current.focus();
                setQuery('');
            }
        }

        inputElem.current.focus();
        document.addEventListener('keydown', focusInputFieldOnEnter);

        // Cleaning up the eventlistener created to track keydown action.
        return () => document.removeEventListener('keydown', focusInputFieldOnEnter);
    }, [setQuery])

    return (
        <input
            className="search"
            type="text"
            placeholder="Search movies..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            //  2)  Connecting our reference variable to the input field
            ref={inputElem}
        />
    );
}

function NumResults({ movies }) {
    return (
        <p className="num-results">
            Found <strong>{movies?.length}</strong> results
        </p>
    );
}

function NavBar({ children }) {
    return <nav className="nav-bar">{children}</nav>;
}

function Movie({ movie, onSelectMovie }) {
    return (
        <li onClick={() => onSelectMovie(movie.imdbID)}>
            <img src={movie.Poster} alt={`${movie.Title} poster`} />
            <h3>{movie.Title}</h3>
            <div>
                <p>
                    <span>🗓</span>
                    <span>{movie.Year}</span>
                </p>
            </div>
        </li>
    );
}

function MovieDetails({ selectedId, onCloseMovie, onAddWatched, watched }) {
    const [movie, setMovie] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [userRating, setUserRating] = useState(0);
    const [isWatched, setIsWatched] = useState({});

    // Just as an exercise to show the useRef hook use we'll create an counter
    // that will register how many times the user will rate a specific film before
    // the definitive rating choice. The value recorded in the useRef variable will
    // be persisted across the component re-renders and when it changes it will not
    // trigger a re-render like an state does.
    const countRatingDecision = useRef(0);

    useEffect(() => {
        // We'll count the rating decisions just when the user is rating the movie.
        // So, we need the userRating state as a dependency.
        // As we already knows, we can't use this reference variable
        // on the render logic, but just inside an useEffect hook, after
        // the component renders.
        if (userRating) {
            countRatingDecision.current++;
        }
    }, [userRating]);

    // We'll need to load the movie details each time this component mounts.
    // But, we need to update it each time the selectedId changes too.
    // Also, we need to check watched movies each time we show movie details.
    // For that we just need to inform the selectedId and watched dependencies.
    useEffect(() => {

        function checkWatchedMovie() {
            const watchedMovie = watched.filter((item) => item.imdbID === selectedId);
            watchedMovie.length ? setIsWatched(watchedMovie[0]) : setIsWatched({});
        }

        async function getMovieDetails() {
            setIsLoading(true);
            setError('');
            try {
                const res = await fetch(
                    `http://www.omdbapi.com/?apikey=${APIKEY}&i=${selectedId}`
                );

                if (!res.ok) {
                    throw new Error("Something went wrong with fetching movie details.");
                }

                const data = await res.json();

                if (data.Response === "False") {
                    throw new Error(data.Error);
                }

                setMovie(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        }

        getMovieDetails();
        checkWatchedMovie();

    }, [selectedId, watched]);


    // This function will initialise a listener to check if the Esc key
    // was pressed, so we'll close the movie detail section.
    useEffect(() => {
        const escToCloseDetails = (ev) => {
            if (ev.code === 'Escape') {
                onCloseMovie();
            }
        }

        document.addEventListener("keydown", escToCloseDetails);

        // With this cleanup function we're ensure that each event listener
        // will be removed after bein created on component re-renders.
        return () => document.removeEventListener('keydown', escToCloseDetails);

    }, [onCloseMovie]);

    const {
        Actors: actors,
        Director: director,
        Genre: genre,
        Plot: plot,
        Poster: poster,
        Released: released,
        Runtime: runtime,
        Title: title,
        Year: year,
        imdbRating
    } = movie;

    function handleAddWatched() {
        const newWatchedMovie = {
            imdbID: selectedId,
            title,
            year,
            poster,
            imdbRating: Number(imdbRating),
            runtime: Number(runtime.split(' ').at(0)),
            userRating,
            // OBS: useRef variables is used just behind the scenes
            // of an React application and it's value is not used to be
            // rendered with any component.
            countRatingDecision: countRatingDecision.current
        }
        onAddWatched(newWatchedMovie);
        onCloseMovie();
    }

    // In this case we're using a resource called "cleanup effect".
    // It's a function returned everytime the component unmounts or re-render.
    // After setting the page title and then close the movie details component
    // the title keeps with the last information. So now we're setting up the
    // title to the original one after we get out of the movie details.
    useEffect(() => {
        if (!title) return;
        document.title = `Movie: ${title}`;

        // Cleanup effect to set default title when component unmount or re-render
        return () => document.title = 'usePopcorn';
    }, [title])

    return (
        <div className="details">
            {isLoading && <Loader />}
            {!isLoading && error && <ShowError message={error} />}
            {!isLoading && !error && (<>
                <header>
                    <button className="btn-back" onClick={onCloseMovie}>
                        &larr;
                    </button>
                    <img src={poster} alt={`Poster of ${movie} movie`} />
                    <div className="details-overview">
                        <h2>{title}</h2>
                        <p>
                            {released} &bull; {runtime}
                        </p>
                        <p>{genre}</p>
                        <p>
                            <span>⭐</span> {imdbRating} IMDB Rating
                        </p>
                    </div>
                </header>
                <section>
                    <div className="rating">
                        {isWatched?.imdbID ? (
                            <p>
                                You rated this movie with {isWatched.userRating}<span>⭐</span>
                            </p>
                        ) : (
                            <>
                                <StarRating
                                    maxRating={10}
                                    size={22}
                                    onSetRating={setUserRating}
                                />
                                {userRating > 0 && <button className="btn-add" onClick={handleAddWatched}>+ Add watched movie</button>}
                            </>
                        )
                        }
                    </div>

                    <p>
                        <em>{plot}</em>
                    </p>
                    <p>Starring {actors}</p>
                    <p>Directed by {director}</p>
                </section>
            </>)}
        </div>
    );
}

function MovieList({ movies, onSelectMovie }) {
    return (
        <ul className="list list-movies">
            {movies?.map((movie) => (
                <Movie
                    movie={movie}
                    key={movie.imdbID}
                    onSelectMovie={onSelectMovie}
                />
            ))}
        </ul>
    );
}

function Box({ children }) {
    const [isOpen, setIsOpen] = useState(true);
    return (
        <div className="box">
            <button
                className="btn-toggle"
                onClick={() => setIsOpen((open) => !open)}
            >
                {isOpen ? "–" : "+"}
            </button>
            {isOpen && children}
        </div>
    );
}

function WatchedSummary({ watched }) {
    const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
    const avgUserRating = average(watched.map((movie) => movie.userRating));
    const avgRuntime = average(watched.map((movie) => movie.runtime));

    return (
        <div className="summary">
            <h2>Movies you watched</h2>
            <div>
                <p>
                    <span>#️⃣</span>
                    <span>{watched.length} movies</span>
                </p>
                <p>
                    <span>⭐️</span>
                    <span>{avgImdbRating.toFixed(2)}</span>
                </p>
                <p>
                    <span>🌟</span>
                    <span>{avgUserRating.toFixed(2)}</span>
                </p>
                <p>
                    <span>⏳</span>
                    <span>{avgRuntime} min</span>
                </p>
            </div>
        </div>
    );
}

function WatchedMovie({ movie, onDeleteWatched }) {
    return (
        <li>
            <img src={movie.poster} alt={`${movie.title} poster`} />
            <h3>{movie.title}</h3>
            <div>
                <p>
                    <span>⭐️</span>
                    <span>{movie.imdbRating}</span>
                </p>
                <p>
                    <span>🌟</span>
                    <span>{movie.userRating}</span>
                </p>
                <p>
                    <span>⏳</span>
                    <span>{movie.runtime} min</span>
                </p>
            </div>
            <button className="btn-delete" onClick={() => onDeleteWatched(movie.imdbID)}>
                x
            </button>
        </li>
    );
}

function WatchedMoviesList({ watched, onDeleteWatched }) {
    return (
        <ul className="list">
            {watched.map((movie) => (
                <WatchedMovie movie={movie} key={movie.imdbID} onDeleteWatched={onDeleteWatched} />
            ))}
        </ul>
    );
}

function Main({ children }) {
    return <main className="main">{children}</main>;
}

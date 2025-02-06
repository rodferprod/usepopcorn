import { useEffect, useState } from "react";
import StarRating from "./StarRating";

const tempMovieData = [
    {
        imdbID: "tt1375666",
        Title: "Inception",
        Year: "2010",
        Poster: "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
    },
    {
        imdbID: "tt0133093",
        Title: "The Matrix",
        Year: "1999",
        Poster: "https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg",
    },
    {
        imdbID: "tt6751668",
        Title: "Parasite",
        Year: "2019",
        Poster: "https://m.media-amazon.com/images/M/MV5BYWZjMjk3ZTItODQ2ZC00NTY5LWE0ZDYtZTI3MjcwN2Q5NTVkXkEyXkFqcGdeQXVyODk4OTc3MTY@._V1_SX300.jpg",
    },
];

const tempWatchedData = [
    {
        imdbID: "tt1375666",
        Title: "Inception",
        Year: "2010",
        Poster: "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
        runtime: 148,
        imdbRating: 8.8,
        userRating: 10,
    },
    {
        imdbID: "tt0088763",
        Title: "Back to the Future",
        Year: "1985",
        Poster: "https://m.media-amazon.com/images/M/MV5BZmU0M2Y1OGUtZjIxNi00ZjBkLTg1MjgtOWIyNThiZWIwYjRiXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg",
        runtime: 116,
        imdbRating: 8.5,
        userRating: 9,
    },
];

const average = (arr) =>
    arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

const APIKEY = "YOUR_API_KEY";

export default function App() {
    const [query, setQuery] = useState("interstellar");
    const [movies, setMovies] = useState([]);
    const [watched, setWatched] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [selectedId, setSelectedId] = useState(null);

    function handleSelectMovie(id) {
        setSelectedId((selectedId) => (selectedId === id ? null : id));
    }

    function handleCloseSelectedMovie() {
        setSelectedId(null);
    }

    function handleAddWatched(movie) {
        setWatched((watched) => [...watched, movie]);
    }

    function handleDeleteWatched(id) {
        setWatched((watched) => watched.filter(movie => movie.imdbID !== id));
    }

    // This function will load the initial movies from the API each time
    // we access the web app. Then, when we search for another movie
    // it will be triggered again as we're informing "query" as dependency.
    useEffect(() => {
        async function fetchMovies() {
            setError("");
            setIsLoading(true);
            try {
                const res = await fetch(
                    `http://www.omdbapi.com/?apikey=${APIKEY}&s=${query}`
                );

                if (!res.ok) {
                    throw new Error(
                        "Something went wrong with fetching movies."
                    );
                }

                const data = await res.json();

                if (data.Response === "False") {
                    throw new Error(data.Error);
                }

                setMovies(data.Search);
            } catch (err) {
                setError(err.message);
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
    }, [query]);

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
    return (
        <input
            className="search"
            type="text"
            placeholder="Search movies..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
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

    // We'll need to load the movie details each time this component mounts.
    // But, we need to update it each time the selectedId changes too. For that
    // we just need to inform the selectedId dependency.
    useEffect(() => {
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
    }, [selectedId]);

    const {
        Actors: actors,
        Awards: awards,
        BoxOffice: boxOffice,
        Country: country,
        DVD: dvd,
        Director: director,
        Genre: genre,
        Language: language,
        Metascore: metascore,
        Plot: plot,
        Poster: poster,
        Production: production,
        Rated: rated,
        Ratings: ratings,
        Released: released,
        Response: response,
        Runtime: runtime,
        Title: title,
        Type: type,
        Website: website,
        Writer: writer,
        Year: year,
        imdbID,
        imdbRating,
        imdbVotes,
    } = movie;

    function handleAddWatched() {
        const newWatchedMovie = {
            imdbID: selectedId,
            title,
            year,
            poster,
            imdbRating: Number(imdbRating),
            runtime: Number(runtime.split(' ').at(0)),
            userRating
        }
        onAddWatched(newWatchedMovie);
        onCloseMovie();
    }

    function checkWatchedMovie() {
        const watchedMovie = watched.filter((item) => item.imdbID === selectedId);
        watchedMovie.length ? setIsWatched(watchedMovie[0]) : setIsWatched({});
    }

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

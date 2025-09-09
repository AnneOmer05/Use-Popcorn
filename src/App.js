import { useEffect, useRef, useState } from "react";
import StarRating from "./starRating";
import { useMovies } from "./useMovies";
import { useLocalStorageState } from "./useLocalStorageState";
import { useKey } from "./useKey";

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

function NavBar({ children }) {
  return <nav className="nav-bar">{children}</nav>;
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
  const inputEl = useRef(null);

  useKey("Enter", function () {
    if (document.activeElement === inputEl.current) return;
    inputEl.current.focus();
    setQuery("");
  });

  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      ref={inputEl}
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
function Main({ children }) {
  return <main className="main">{children}</main>;
}

function ListBox({ children }) {
  const [isOpen1, setIsOpen1] = useState(true);
  return (
    <div className="box">
      <button
        className="btn-toggle"
        onClick={() => setIsOpen1((open) => !open)}
      >
        {isOpen1 ? "–" : "+"}
      </button>
      {isOpen1 && children}
    </div>
  );
}
function MoviesList({ movies, onhandleSelectedMovie }) {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movie
          movie={movie}
          key={movie.imdbID}
          onhandleSelectedMovie={onhandleSelectedMovie}
        />
      ))}
    </ul>
  );
}

function Movie({ movie, onhandleSelectedMovie }) {
  return (
    <li onClick={() => onhandleSelectedMovie(movie.imdbID)}>
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

function SelectedMovie({ id, oncloseMovie, onAddWatched, watched }) {
  const [movie, setmovie] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [userRating, setUserRating] = useState("");
  const countRef = useRef(0);

  const isWatched = watched.map((movie) => movie.imdbID).includes(id);
  const watchedUserRating = watched.find(
    (movie) => movie.imdbID === id
  )?.userRating;

  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre,
  } = movie;

  useEffect(
    function () {
      if (userRating) countRef.current++;
    },
    [userRating]
  );

  useKey("Escape", oncloseMovie);

  useEffect(
    function () {
      if (!title) return;
      document.title = `Movie | ${title}`;

      return function () {
        document.title = "Use Popcorn";
      };
    },

    [title]
  );
  function handleAddWatched() {
    const newMovie = {
      title,
      imdbID: id,
      year,
      poster,
      imdbRating: Number(imdbRating),
      runtime: Number(runtime.split(" ").at(0)),
      userRating,
    };
    onAddWatched(newMovie);
    oncloseMovie();
  }
  useEffect(
    function () {
      async function getMovieDetails() {
        setIsLoading(true);
        const res = await fetch(
          `https://www.omdbapi.com/?apikey=${KEY}&i=${id}`
        );
        const data = await res.json();
        setmovie(data);
        setIsLoading(false);
      }

      getMovieDetails();
    },
    [id]
  );

  return (
    <div className="details">
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <header>
            <button className=" btn-back" onClick={oncloseMovie}>
              &larr;
            </button>
            <img src={poster} alt={`poster of ${title}`} />
            <div className="details-overview">
              <h2>{title}</h2>
              <p>
                {released} &bull; {runtime}
              </p>
              <p>{genre}</p>
              <p>
                <span>⭐</span>
                {` ${imdbRating}  imdbRating`}
              </p>
            </div>
          </header>

          <section>
            <div className="rating">
              {!isWatched ? (
                <>
                  <StarRating
                    maxRating={10}
                    size={24}
                    onSetRating={setUserRating}
                  />
                  {userRating > 0 && (
                    <button className="btn-add" onClick={handleAddWatched}>
                      + Add To List
                    </button>
                  )}
                </>
              ) : (
                <p>
                  You rated this movie {watchedUserRating} <span>⭐</span>
                </p>
              )}
            </div>
            <p>
              <em>{plot}</em>
            </p>
            <p>Starring {actors}</p>
            <p>Directed by {director}</p>
          </section>
        </>
      )}
    </div>
  );
}

function WatchedMoviesBox({ selectedMovie, oncloseMovie }) {
  const [watched, setWatched] = useLocalStorageState([], "watched");
  const [isOpen2, setIsOpen2] = useState(true);

  function handleAddWatchedMovie(movie) {
    setWatched((watched) => [...watched, movie]);
  }

  function handleDeleteMovie(id) {
    setWatched(watched.filter((movie) => movie.imdbID !== id));
  }

  return (
    <div className="box">
      <button
        className="btn-toggle"
        onClick={() => setIsOpen2((open) => !open)}
      >
        {isOpen2 ? "–" : "+"}
      </button>

      {!isOpen2 ? (
        ""
      ) : selectedMovie ? (
        <SelectedMovie
          id={selectedMovie}
          oncloseMovie={oncloseMovie}
          onAddWatched={handleAddWatchedMovie}
          watched={watched}
        />
      ) : (
        <>
          <WatchedMoviesSummary watched={watched} />
          <WatchedMoviesList
            watched={watched}
            onDeleteList={handleDeleteMovie}
          />
        </>
      )}
    </div>
  );
}

function WatchedMoviesSummary({ watched }) {
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
          <span>{avgRuntime.toFixed(2)} min</span>
        </p>
      </div>
    </div>
  );
}

function WatchedMoviesList({ watched, onDeleteList }) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovie
          movie={movie}
          key={movie.imdbID}
          onDeleteList={onDeleteList}
        />
      ))}
    </ul>
  );
}

function WatchedMovie({ movie, onDeleteList }) {
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
        <button
          className="btn-delete"
          onClick={() => onDeleteList(movie.imdbID)}
        >
          x
        </button>
      </div>
    </li>
  );
}

function Loader() {
  return <p className="loader">Loading Please wait ....</p>;
}
function ErrorMessage({ message }) {
  console.log(message);
  return <p className="error">{message}</p>;
}

const KEY = "88fd5098";

export default function App() {
  const [query, setQuery] = useState("");

  const [selectedMovie, setSelectedMovie] = useState(null);

  const { movies, isLoading, errorMessage } = useMovies(query);

  function handleSelectedMovie(id) {
    setSelectedMovie(id === selectedMovie ? null : id);
  }

  function handleCloseMovie() {
    setSelectedMovie(null);
  }

  return (
    <>
      <NavBar>
        <Logo />
        <Search query={query} setQuery={setQuery} />
        <NumResults movies={movies} />
      </NavBar>
      <Main>
        <ListBox>
          {isLoading && <Loader />}
          {!isLoading && !errorMessage && (
            <MoviesList
              movies={movies}
              onhandleSelectedMovie={handleSelectedMovie}
            />
          )}
          {errorMessage && <ErrorMessage message={errorMessage} />}
        </ListBox>
        <WatchedMoviesBox
          selectedMovie={selectedMovie}
          oncloseMovie={handleCloseMovie}
        />
      </Main>
    </>
  );
}

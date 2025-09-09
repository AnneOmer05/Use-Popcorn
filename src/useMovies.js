import { useEffect, useState } from "react";
const KEY = "88fd5098";

export function useMovies(query) {
  const [movies, setMovies] = useState([]);
  const [isLoading, setisLoading] = useState(false);
  const [errorMessage, seterrorMessage] = useState("");
  useEffect(
    function () {
      const controller = new AbortController();

      async function fetchMovies() {
        try {
          seterrorMessage("");
          setisLoading(true);
          const res = await fetch(
            `https://www.omdbapi.com/?apikey=${KEY}&s=${query}`,
            { signal: controller.signal }
          );
          if (!res.ok) throw new Error("Failed to fetch");

          const data = await res.json();
          if (data.Response === "False") throw new Error("Movie not found");

          setMovies(data.Search);
          seterrorMessage("");

          console.log(data);
        } catch (error) {
          if (error.name !== "AbortError") seterrorMessage(error.message);
        } finally {
          setisLoading(false);
        }
      }

      if (query.length < 3) {
        setMovies([]);
        seterrorMessage("");
        return;
      }
      // handleCloseMovie();
      fetchMovies();
      return function () {
        controller.abort();
      };
    },
    [query]
  );

  return { movies, isLoading, errorMessage };
}

import { useState, useEffect } from "react";
export function useLocalStorageState(initialState, key) {
  const [value, setvalue] = useState(function () {
    const storedMovies = localStorage.getItem(key);
    return storedMovies ? JSON.parse(storedMovies) : initialState;
  });

  useEffect(
    function () {
      localStorage.setItem(key, JSON.stringify(value));
    },
    [value, key]
  );

  return [value, setvalue];
}

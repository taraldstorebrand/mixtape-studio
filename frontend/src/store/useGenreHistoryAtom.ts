import { useAtom } from 'jotai';
import { useEffect } from 'react';
import { genreHistoryAtom } from './atoms';

const GENRE_HISTORY_KEY = 'sangtekst_genre_history';
const MAX_GENRES = 50;

export function useGenreHistoryAtom() {
  const [genres, setGenres] = useAtom(genreHistoryAtom);

  useEffect(() => {
    localStorage.setItem(GENRE_HISTORY_KEY, JSON.stringify(genres));
  }, [genres]);

  const addGenre = (genre: string) => {
    const trimmed = genre.trim();
    if (!trimmed) return;

    setGenres((prev) => {
      const filtered = prev.filter((g) => g.toLowerCase() !== trimmed.toLowerCase());
      return [trimmed, ...filtered].slice(0, MAX_GENRES);
    });
  };

  const removeGenre = (genre: string) => {
    setGenres((prev) => prev.filter((g) => g !== genre));
  };

  return { genres, addGenre, removeGenre };
}

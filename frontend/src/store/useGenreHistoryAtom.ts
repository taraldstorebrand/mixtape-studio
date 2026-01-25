import { useAtom } from 'jotai';
import { useEffect } from 'react';
import { genreHistoryAtom } from './atoms';

const GENRE_HISTORY_KEY = 'sangtekst_genre_history';
const MAX_GENRES = 50;

const loadGenreHistory = (): string[] => {
  const saved = localStorage.getItem(GENRE_HISTORY_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return [];
    }
  }
  return [];
};

export function useGenreHistoryAtom() {
  const [genres, setGenres] = useAtom(genreHistoryAtom);

  useEffect(() => {
    setGenres(loadGenreHistory());
  }, [setGenres]);

  useEffect(() => {
    if (genres.length > 0) {
      localStorage.setItem(GENRE_HISTORY_KEY, JSON.stringify(genres));
    }
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

import { useState, useEffect } from 'react';

const GENRE_HISTORY_KEY = 'sangtekst_genre_history';
const MAX_GENRES = 50;

export function useGenreHistory() {
  const [genres, setGenres] = useState<string[]>(() => {
    const saved = localStorage.getItem(GENRE_HISTORY_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem(GENRE_HISTORY_KEY, JSON.stringify(genres));
  }, [genres]);

  const addGenre = (genre: string) => {
    const trimmed = genre.trim();
    if (!trimmed) return;
    
    setGenres((prev) => {
      const filtered = prev.filter((g) => g.toLowerCase() !== trimmed.toLowerCase());
      const updated = [trimmed, ...filtered].slice(0, MAX_GENRES);
      return updated;
    });
  };

  const removeGenre = (genre: string) => {
    setGenres((prev) => prev.filter((g) => g !== genre));
  };

  return { genres, addGenre, removeGenre };
}

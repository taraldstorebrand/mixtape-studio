import { useAtom } from 'jotai';
import { useEffect, useRef } from 'react';
import { genreHistoryAtom } from './atoms';
import {
  fetchGenres,
  addGenre as apiAddGenre,
  removeGenre as apiRemoveGenre,
} from '../services/api';

export function useGenreHistoryAtom() {
  const [genres, setGenres] = useAtom(genreHistoryAtom);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const initializeGenres = async () => {
      try {
        const items = await fetchGenres();
        setGenres(items);
      } catch (error) {
        console.error('Failed to fetch genres:', error);
      }
    };

    initializeGenres();
  }, [setGenres]);

  const addGenre = async (genre: string) => {
    const trimmed = genre.trim();
    if (!trimmed) return;

    setGenres((prev) => {
      const filtered = prev.filter(
        (g) => g.toLowerCase() !== trimmed.toLowerCase()
      );
      return [trimmed, ...filtered];
    });

    try {
      await apiAddGenre(trimmed);
    } catch (error) {
      console.error('Failed to add genre:', error);
      try {
        const items = await fetchGenres();
        setGenres(items);
      } catch {
        // Keep optimistic state if fetch also fails
      }
    }
  };

  const removeGenre = async (genre: string) => {
    setGenres((prev) => prev.filter((g) => g !== genre));

    try {
      await apiRemoveGenre(genre);
    } catch (error) {
      console.error('Failed to remove genre:', error);
      try {
        const items = await fetchGenres();
        setGenres(items);
      } catch {
        // Keep optimistic state if fetch also fails
      }
    }
  };

  return { genres, addGenre, removeGenre };
}

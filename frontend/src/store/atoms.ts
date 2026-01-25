import { atom } from 'jotai';
import { HistoryItem } from '../types';
import { getHistory } from '../services/storage';

export const historyAtom = atom<HistoryItem[]>(getHistory());

export const selectedItemIdAtom = atom<string | null>(null);

export const selectedItemAtom = atom((get) => {
  const id = get(selectedItemIdAtom);
  if (!id) return null;
  const history = get(historyAtom);
  return history.find((item) => item.id === id) ?? null;
});

export const isGeneratingSongAtom = atom<boolean>(false);

const loadGenreHistory = (): string[] => {
  const saved = localStorage.getItem('sangtekst_genre_history');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return [];
    }
  }
  return [];
};

export const genreHistoryAtom = atom<string[]>(loadGenreHistory());

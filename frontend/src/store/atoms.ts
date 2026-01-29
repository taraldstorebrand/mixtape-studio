import { atom } from 'jotai';
import { HistoryItem } from '../types';

export type SongGenerationStatus = 'idle' | 'pending' | 'completed' | 'failed';

export const historyAtom = atom<HistoryItem[]>([]);

export const selectedItemIdAtom = atom<string | null>(null);

export const selectedItemAtom = atom((get) => {
  const id = get(selectedItemIdAtom);
  if (!id) return null;
  const history = get(historyAtom);
  return history.find((item) => item.id === id) ?? null;
});

export const songGenerationStatusAtom = atom<SongGenerationStatus>('idle');

export const genreHistoryAtom = atom<string[]>([]);

// Global audio playback state
export const nowPlayingAtom = atom<HistoryItem | null>(null);

export const audioRefAtom = atom<HTMLAudioElement | null>(null);

export const isPlayingAtom = atom<boolean>(false);

export const currentTimeAtom = atom<number>(0);

export const durationAtom = atom<number>(0);

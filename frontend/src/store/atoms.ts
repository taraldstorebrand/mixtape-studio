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

// Audio source for playback (ID + URL snapshot, immutable once set)
type AudioSource = { id: string; url: string } | null;
export const audioSourceAtom = atom<AudioSource>(null);

// Derived atom that returns the full HistoryItem (synced with historyAtom for UI display)
export const nowPlayingAtom = atom((get) => {
  const source = get(audioSourceAtom);
  if (!source) return null;
  const history = get(historyAtom);
  return history.find((item) => item.id === source.id) ?? null;
});

export const audioRefAtom = atom<HTMLAudioElement | null>(null);

export const isPlayingAtom = atom<boolean>(false);

export const currentTimeAtom = atom<number>(0);

export const durationAtom = atom<number>(0);

// Volume control (0-1 range, initialized via useVolumeAtom hook per D-040)
export const volumeAtom = atom<number>(1.0);

// Filtered history list (updated by HistoryList component based on active filter)
export const filteredHistoryAtom = atom<HistoryItem[]>([]);

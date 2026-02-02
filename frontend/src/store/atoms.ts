import { atom } from 'jotai';
import { HistoryItem, Playlist } from '../types';

export type SongGenerationStatus = 'idle' | 'pending' | 'completed' | 'failed';
export type FilterType = 'default' | 'liked' | 'all';

export const historyAtom = atom<HistoryItem[]>([]);

export const filterAtom = atom<FilterType>('default');

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

// Filtered history list (derived from historyAtom and filterAtom)
export const filteredHistoryAtom = atom((get) => {
  const history = get(historyAtom);
  const filter = get(filterAtom);

  return history.filter((item) => {
    if (filter === 'all') return true;
    if (filter === 'liked') return item.feedback === 'up';
    return item.feedback !== 'down';
  });
});

// Playback queue - captures song IDs at the moment playback starts (D-052)
// Queue remains stable during filter changes; reset only when user manually selects a new song
export const playbackQueueAtom = atom<string[]>([]);

// Editor overlay state - independent of selectedId (D-xxx)
// true = show editor overlay, false = show detail view (or empty state if no selection)
export const editorOpenAtom = atom<boolean>(false);

// Playlist state
export const playlistsAtom = atom<Playlist[]>([]);

// Currently selected playlist ID (null = library mode)
// This atom represents view context only. HistoryList fetches playlist data on change.
export const selectedPlaylistIdAtom = atom<string | null>(null);

// Songs in the currently selected playlist (null = library mode)
export const currentPlaylistSongsAtom = atom<HistoryItem[] | null>(null);

// Global error state for error banner
export const globalErrorAtom = atom<string | null>(null);

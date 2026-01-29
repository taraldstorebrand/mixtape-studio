import { useAtom } from 'jotai';
import { useEffect, useRef } from 'react';
import { volumeAtom } from './atoms';

const STORAGE_KEY = 'sangtekst_audio_volume';

export function useVolumeAtom() {
  const [volume, setVolumeInternal] = useAtom(volumeAtom);
  const initializedRef = useRef(false);

  // Load from localStorage on mount (D-040: side effects in useEffect, not atom init)
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      const parsed = parseFloat(stored);
      if (!isNaN(parsed)) {
        setVolumeInternal(Math.max(0, Math.min(1, parsed)));
      }
    }
  }, [setVolumeInternal]);

  // Persist to localStorage on change (D-022: sangtekst_ prefix)
  const setVolume = (newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setVolumeInternal(clampedVolume);
    localStorage.setItem(STORAGE_KEY, clampedVolume.toString());
  };

  return { volume, setVolume };
}

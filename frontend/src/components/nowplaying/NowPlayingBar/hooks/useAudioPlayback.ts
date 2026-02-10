import { useEffect, useRef } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import {
  audioSourceAtom,
  nowPlayingAtom,
  audioRefAtom,
  isPlayingAtom,
  currentTimeAtom,
  durationAtom,
  currentPlaylistSongsAtom,
  currentPlaylistEntriesAtom,
  filteredHistoryAtom,
  playbackQueueAtom,
  currentQueueIndexAtom,
  historyAtom,
  selectedQueueEntryIdAtom,
} from '../../../../store/atoms';
import { HistoryItem } from '../../../../types';
import { t } from '../../../../i18n';

export function useAudioPlayback() {
  const [audioSource, setAudioSource] = useAtom(audioSourceAtom);
  const nowPlaying = useAtomValue(nowPlayingAtom);
  const [, setAudioRef] = useAtom(audioRefAtom);
  const [isPlaying, setIsPlaying] = useAtom(isPlayingAtom);
  const [currentTime, setCurrentTime] = useAtom(currentTimeAtom);
  const [duration, setDuration] = useAtom(durationAtom);
  const filteredHistory = useAtomValue(filteredHistoryAtom);
  const currentPlaylistSongs = useAtomValue(currentPlaylistSongsAtom);
  const currentPlaylistEntries = useAtomValue(currentPlaylistEntriesAtom);
  const [playbackQueue, setPlaybackQueue] = useAtom(playbackQueueAtom);
  const [currentQueueIndex, setCurrentQueueIndex] = useAtom(currentQueueIndexAtom);
  const [, setSelectedQueueEntryId] = useAtom(selectedQueueEntryIdAtom);
  const history = useAtomValue(historyAtom);
  const internalAudioRef = useRef<HTMLAudioElement>(null);
  const skipNextLoadRef = useRef(false);

  // Refs to avoid stale closures in event handlers
  const playbackQueueRef = useRef(playbackQueue);
  const currentQueueIndexRef = useRef(currentQueueIndex);
  const historyRef = useRef(history);
  const currentPlaylistSongsRef = useRef(currentPlaylistSongs);
  const audioSourceRef = useRef(audioSource);
  const currentTimeRef = useRef(currentTime);

  useEffect(() => {
    playbackQueueRef.current = playbackQueue;
  }, [playbackQueue]);

  useEffect(() => {
    currentQueueIndexRef.current = currentQueueIndex;
  }, [currentQueueIndex]);

  useEffect(() => {
    historyRef.current = history;
  }, [history]);

  useEffect(() => {
    currentPlaylistSongsRef.current = currentPlaylistSongs;
  }, [currentPlaylistSongs]);

  useEffect(() => {
    audioSourceRef.current = audioSource;
  }, [audioSource]);

  useEffect(() => {
    currentTimeRef.current = currentTime;
  }, [currentTime]);

  // Update playback queue when context changes (playlist ↔ library) while a song is playing
  useEffect(() => {
    if (!audioSourceRef.current) return;

    if (currentPlaylistEntries) {
      // In playlist mode: use the actual entry IDs from the playlist
      setPlaybackQueue(currentPlaylistEntries.map((entry) => ({ entryId: entry.entryId, songId: entry.song.id })));
    } else {
      // In library mode: generate new entry IDs
      setPlaybackQueue(filteredHistory.map((s, index) => ({ entryId: `entry-${Date.now()}-${index}`, songId: s.id })));
    }
  }, [currentPlaylistEntries, filteredHistory, setPlaybackQueue]);

  // Initialize audio ref atom
  useEffect(() => {
    if (internalAudioRef.current) {
      setAudioRef(internalAudioRef.current);
    }
  }, [setAudioRef]);

  // Handle audio events
  useEffect(() => {
    const audio = internalAudioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleDurationChange = () => {
      setDuration(audio.duration || 0);
    };

    const handleEnded = () => {
      // Autoplay next song in queue (D-052)
      // Play directly on the audio element to preserve autoplay permission
      // on mobile lockscreens. Going through React state loses the browser's
      // "autoplay after ended" context.
      const queue = playbackQueueRef.current;
      const queueIndex = currentQueueIndexRef.current;
      const allSongs = historyRef.current;
      const playlistSongs = currentPlaylistSongsRef.current;

      if (queue.length === 0) {
        setIsPlaying(false);
        setAudioSource(null);
        setCurrentTime(0);
        return;
      }

      const songsToSearch = allSongs;

      const playNext = (song: HistoryItem, url: string, index: number) => {
        audio.src = url;
        audio.play().catch(() => setIsPlaying(false));
        skipNextLoadRef.current = true;
        setCurrentQueueIndex(index);
        setAudioSource({ id: song.id, url });
      };

      for (let i = queueIndex + 1; i < queue.length; i++) {
        const nextEntry = queue[i];
        const nextSong = songsToSearch.find((s) => s.id === nextEntry.songId);
        const nextUrl = nextSong?.sunoLocalUrl || nextSong?.sunoAudioUrl;

        if (nextSong && nextUrl) {
          playNext(nextSong, nextUrl, i);
          return;
        }
      }

      if (playlistSongs) {
        for (let i = 0; i < queueIndex; i++) {
          const nextEntry = queue[i];
          const nextSong = songsToSearch.find((s) => s.id === nextEntry.songId);
          const nextUrl = nextSong?.sunoLocalUrl || nextSong?.sunoAudioUrl;

          if (nextSong && nextUrl) {
            playNext(nextSong, nextUrl, i);
            return;
          }
        }
      }

      setIsPlaying(false);
      setAudioSource(null);
      setCurrentTime(0);
    };

    const handlePlay = () => {
      setIsPlaying(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handleError = () => {
      setIsPlaying(false);
      setAudioSource(null);
      setCurrentTime(0);
      setDuration(0);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('error', handleError);
    };
  }, [setCurrentTime, setDuration, setIsPlaying, setAudioSource]);

  // Load audio when audioSource changes
  useEffect(() => {
    const audio = internalAudioRef.current;
    if (!audio) return;

    if (skipNextLoadRef.current) {
      skipNextLoadRef.current = false;
      return;
    }

    if (!audioSource) {
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
      setCurrentTime(0);
      setDuration(0);
      setIsPlaying(false);
      return;
    }

    audio.pause();
    setCurrentTime(0);
    setDuration(0);
    audio.src = audioSource.url;
    audio.load();
    audio.play().catch((error) => {
      console.error('Failed to play audio:', error);
      setIsPlaying(false);
    });
  }, [audioSource, setIsPlaying, setCurrentTime, setDuration]);

  const play = () => {
    const audio = internalAudioRef.current;
    if (!audio) return;

    audio.play().catch((error) => {
      console.error('Failed to play audio:', error);
      setIsPlaying(false);
    });
  };

  const pause = () => {
    const audio = internalAudioRef.current;
    if (!audio) return;

    audio.pause();
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  const seek = (time: number) => {
    const audio = internalAudioRef.current;
    if (!audio) return;

    audio.currentTime = time;
    setCurrentTime(time);
  };

  const setNowPlaying = (item: HistoryItem | null, queueIndex?: number) => {
    if (!item) {
      setAudioSource(null);
      setSelectedQueueEntryId(null);
      return;
    }
    const url = item.sunoLocalUrl || item.sunoAudioUrl;
    if (url) {
      // If queueIndex is provided and we have an existing queue, use it (for next/prev navigation)
      if (queueIndex !== undefined && playbackQueue.length > 0 && queueIndex >= 0 && queueIndex < playbackQueue.length) {
        setCurrentQueueIndex(queueIndex);
        setSelectedQueueEntryId(playbackQueue[queueIndex].entryId);
        setAudioSource({ id: item.id, url });
        return;
      }

      // Otherwise, build a new queue (for initial play from a list)
      let newQueue: { entryId: string; songId: string }[];
      let index: number;

      if (currentPlaylistEntries) {
        // In playlist mode: use entry IDs from current playlist
        newQueue = currentPlaylistEntries.map((entry) => ({ entryId: entry.entryId, songId: entry.song.id }));
        index = queueIndex ?? newQueue.findIndex((q) => q.songId === item.id);
      } else {
        // In library mode: generate new entry IDs
        const songsToQueue = filteredHistory;
        newQueue = songsToQueue.map((h, i) => ({ entryId: `entry-${Date.now()}-${i}`, songId: h.id }));
        index = queueIndex ?? songsToQueue.findIndex((h) => h.id === item.id);
      }

      if (index >= 0 && index < newQueue.length) {
        setPlaybackQueue(newQueue);
        setCurrentQueueIndex(index);
        setSelectedQueueEntryId(newQueue[index].entryId);
        setAudioSource({ id: item.id, url });
      }
    }
  };

  const getSongsToSearch = () => {
    // Always use full history to find songs - the queue already defines playback order
    // This ensures we can find songs that exist in the queue but not in the current view
    return history;
  };

  // Create stable refs for next/previous handlers to avoid stale closures in Media Session
  const handlePreviousRef = useRef<(() => void) | null>(null);
  const handleNextRef = useRef<(() => void) | null>(null);

  const playDirectly = (song: HistoryItem, url: string, queueIndex: number) => {
    const audio = internalAudioRef.current;
    if (!audio) return;
    audio.src = url;
    audio.play().catch(() => setIsPlaying(false));
    skipNextLoadRef.current = true;
    setCurrentQueueIndex(queueIndex);
    setNowPlaying(song, queueIndex);
  };

  const handlePrevious = () => {
    const time = Number.isFinite(currentTimeRef.current) ? currentTimeRef.current : 0;
    if (time > 3) {
      seek(0);
      return;
    }

    const queue = playbackQueueRef.current;
    if (queue.length === 0) return;

    const songsToSearch = getSongsToSearch();

    for (let i = currentQueueIndexRef.current - 1; i >= 0; i--) {
      const prevEntry = queue[i];
      const prevSong = songsToSearch.find((s) => s.id === prevEntry.songId);
      const prevUrl = prevSong?.sunoLocalUrl || prevSong?.sunoAudioUrl;
      if (prevSong && prevUrl) {
        playDirectly(prevSong, prevUrl, i);
        return;
      }
    }

    for (let i = queue.length - 1; i > currentQueueIndexRef.current; i--) {
      const prevEntry = queue[i];
      const prevSong = songsToSearch.find((s) => s.id === prevEntry.songId);
      const prevUrl = prevSong?.sunoLocalUrl || prevSong?.sunoAudioUrl;
      if (prevSong && prevUrl) {
        playDirectly(prevSong, prevUrl, i);
        return;
      }
    }
  };

  const handleNext = () => {
    const queue = playbackQueueRef.current;
    if (queue.length === 0) return;

    const songsToSearch = getSongsToSearch();

    for (let i = currentQueueIndexRef.current + 1; i < queue.length; i++) {
      const nextEntry = queue[i];
      const nextSong = songsToSearch.find((s) => s.id === nextEntry.songId);
      const nextUrl = nextSong?.sunoLocalUrl || nextSong?.sunoAudioUrl;
      if (nextSong && nextUrl) {
        playDirectly(nextSong, nextUrl, i);
        return;
      }
    }

    for (let i = 0; i < currentQueueIndexRef.current; i++) {
      const nextEntry = queue[i];
      const nextSong = songsToSearch.find((s) => s.id === nextEntry.songId);
      const nextUrl = nextSong?.sunoLocalUrl || nextSong?.sunoAudioUrl;
      if (nextSong && nextUrl) {
        playDirectly(nextSong, nextUrl, i);
        return;
      }
    }
  };

  // Update refs whenever the handlers change
  useEffect(() => {
    handlePreviousRef.current = handlePrevious;
  }, [handlePrevious]);

  useEffect(() => {
    handleNextRef.current = handleNext;
  }, [handleNext]);

  // Media Session API for lock screen and platform media controls
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) {
      return;
    }

    // Update metadata when nowPlaying changes
    if (nowPlaying) {
      const displayTitle = nowPlaying.title || nowPlaying.prompt || t.messages.untitled;
      const variationLabel = nowPlaying.variationIndex !== undefined ? ` #${nowPlaying.variationIndex + 1}` : '';

      const artwork = nowPlaying.sunoImageUrl ? [
        { src: nowPlaying.sunoImageUrl, sizes: '96x96', type: 'image/jpeg' },
        { src: nowPlaying.sunoImageUrl, sizes: '128x128', type: 'image/jpeg' },
        { src: nowPlaying.sunoImageUrl, sizes: '192x192', type: 'image/jpeg' },
        { src: nowPlaying.sunoImageUrl, sizes: '256x256', type: 'image/jpeg' },
        { src: nowPlaying.sunoImageUrl, sizes: '384x384', type: 'image/jpeg' },
        { src: nowPlaying.sunoImageUrl, sizes: '512x512', type: 'image/jpeg' },
      ] : [];

      try {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: displayTitle + variationLabel,
          artist: nowPlaying.artist || t.messages.unknownArtist,
          album: nowPlaying.album || t.messages.defaultAlbum,
          artwork,
        });
      } catch (error) {
        console.error('Failed to set media session metadata:', error);
      }
    } else {
      try {
        navigator.mediaSession.metadata = null;
      } catch (error) {
        console.error('Failed to clear media session metadata:', error);
      }
    }
  }, [nowPlaying]);

  // Setup action handlers (only run once on mount)
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) {
      return;
    }

    try {
      navigator.mediaSession.setActionHandler('play', () => {
        internalAudioRef.current?.play().catch(() => setIsPlaying(false));
      });

      navigator.mediaSession.setActionHandler('pause', () => {
        internalAudioRef.current?.pause();
      });

      navigator.mediaSession.setActionHandler('previoustrack', () => {
        handlePreviousRef.current?.();
      });

      navigator.mediaSession.setActionHandler('nexttrack', () => {
        handleNextRef.current?.();
      });
    } catch (error) {
      console.error('Failed to set media session action handlers:', error);
    }

    return () => {
      try {
        navigator.mediaSession.setActionHandler('play', null);
        navigator.mediaSession.setActionHandler('pause', null);
        navigator.mediaSession.setActionHandler('previoustrack', null);
        navigator.mediaSession.setActionHandler('nexttrack', null);
      } catch (error) {
        console.error('Failed to clear media session action handlers:', error);
      }
    };
  }, []);

  // Update playback state
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) {
      return;
    }

    try {
      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
    } catch (error) {
      console.error('Failed to update media session playback state:', error);
    }
  }, [isPlaying]);

  // Update position state for progress bar (throttled for Chrome compatibility)
  const lastPositionUpdateRef = useRef(0);
  const lastReportedPositionRef = useRef(0);

  useEffect(() => {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) {
      return;
    }

    if (duration > 0 && currentTime >= 0) {
      const now = Date.now();
      const timeSinceLastUpdate = now - lastPositionUpdateRef.current;
      const positionChange = Math.abs(currentTime - lastReportedPositionRef.current);

      // Only update if:
      // 1. At least 1 second has passed since last update, OR
      // 2. Position has changed by at least 0.5 seconds
      // This prevents excessive updates that cause Chrome to hang
      if (timeSinceLastUpdate >= 1000 || positionChange >= 0.5) {
        try {
          navigator.mediaSession.setPositionState({
            duration,
            playbackRate: 1,
            position: currentTime,
          });
          lastPositionUpdateRef.current = now;
          lastReportedPositionRef.current = currentTime;
        } catch (error) {
          console.error('Failed to update media session position state:', error);
        }
      }
    }
  }, [currentTime, duration]);

  return {
    audioRef: internalAudioRef,
    nowPlaying,
    setNowPlaying,
    isPlaying,
    currentTime,
    duration,
    play,
    pause,
    togglePlayPause,
    seek,
    getSongsToSearch,
    currentQueueIndex,
    setCurrentQueueIndex,
    handlePrevious,
    handleNext,
  };
}

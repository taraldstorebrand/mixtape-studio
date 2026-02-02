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
  filteredHistoryAtom,
  playbackQueueAtom,
  currentQueueIndexAtom,
  historyAtom,
} from '../../../../store';
import { HistoryItem } from '../../../../types';

export function useAudioPlayback() {
  const [audioSource, setAudioSource] = useAtom(audioSourceAtom);
  const nowPlaying = useAtomValue(nowPlayingAtom);
  const [, setAudioRef] = useAtom(audioRefAtom);
  const [isPlaying, setIsPlaying] = useAtom(isPlayingAtom);
  const [currentTime, setCurrentTime] = useAtom(currentTimeAtom);
  const [duration, setDuration] = useAtom(durationAtom);
  const filteredHistory = useAtomValue(filteredHistoryAtom);
  const currentPlaylistSongs = useAtomValue(currentPlaylistSongsAtom);
  const [playbackQueue, setPlaybackQueue] = useAtom(playbackQueueAtom);
  const [currentQueueIndex, setCurrentQueueIndex] = useAtom(currentQueueIndexAtom);
  const history = useAtomValue(historyAtom);
  const internalAudioRef = useRef<HTMLAudioElement>(null);

  // Refs to avoid stale closures in event handlers
  const playbackQueueRef = useRef(playbackQueue);
  const currentQueueIndexRef = useRef(currentQueueIndex);
  const historyRef = useRef(history);
  const currentPlaylistSongsRef = useRef(currentPlaylistSongs);
  const audioSourceRef = useRef(audioSource);

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

  // Update playback queue when context changes (playlist ↔ library) while a song is playing
  useEffect(() => {
    if (!audioSourceRef.current) return;
    const songsForQueue = currentPlaylistSongs ?? filteredHistory;
    setPlaybackQueue(songsToQueue.map((s, index) => ({ entryId: `entry-${Date.now()}-${index}`, songId: s.id })));
  }, [currentPlaylistSongs, setPlaybackQueue]);

  useEffect(() => {
    audioSourceRef.current = audioSource;
  }, [audioSource]);

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

      // Always use full history to find songs - the queue defines playback order
      const songsToSearch = allSongs;

      // Find next valid song (skip deleted songs)
      for (let i = queueIndex + 1; i < queue.length; i++) {
        const nextEntry = queue[i];
        const nextSong = songsToSearch.find((s) => s.id === nextEntry.songId);
        const nextUrl = nextSong?.sunoLocalUrl || nextSong?.sunoAudioUrl;

        if (nextSong && nextUrl) {
          setCurrentQueueIndex(i);
          setAudioSource({ id: nextSong.id, url: nextUrl });
          return;
        }
      }

      // If in playlist mode, wrap to start
      if (playlistSongs) {
        for (let i = 0; i < queueIndex; i++) {
          const nextEntry = queue[i];
          const nextSong = songsToSearch.find((s) => s.id === nextEntry.songId);
          const nextUrl = nextSong?.sunoLocalUrl || nextSong?.sunoAudioUrl;

          if (nextSong && nextUrl) {
            setCurrentQueueIndex(i);
            setAudioSource({ id: nextSong.id, url: nextUrl });
            return;
          }
        }
      }

      // End of queue or no valid songs found - stop playback
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
      return;
    }
    const url = item.sunoLocalUrl || item.sunoAudioUrl;
    if (url) {
      // Use playlist if in playlist mode, otherwise use filtered library
      const songsToQueue = currentPlaylistSongs ?? filteredHistory;
      setPlaybackQueue(songsToQueue.map((h, index) => ({ entryId: `entry-${Date.now()}-${index}`, songId: h.id })));
      // Set queue index if provided, otherwise find first occurrence
      const index = queueIndex ?? songsToQueue.findIndex((h) => h.id === item.id);
      setCurrentQueueIndex(index >= 0 ? index : 0);
      setAudioSource({ id: item.id, url });
    }
  };

  const getSongsToSearch = () => {
    // Always use full history to find songs - the queue already defines playback order
    // This ensures we can find songs that exist in the queue but not in the current view
    return history;
  };

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
  };
}

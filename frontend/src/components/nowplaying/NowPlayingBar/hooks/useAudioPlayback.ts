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
  const history = useAtomValue(historyAtom);
  const internalAudioRef = useRef<HTMLAudioElement>(null);

  // Refs to avoid stale closures in event handlers
  const playbackQueueRef = useRef(playbackQueue);
  const historyRef = useRef(history);
  const currentPlaylistSongsRef = useRef(currentPlaylistSongs);
  const audioSourceRef = useRef(audioSource);

  useEffect(() => {
    playbackQueueRef.current = playbackQueue;
  }, [playbackQueue]);

  useEffect(() => {
    historyRef.current = history;
  }, [history]);

  useEffect(() => {
    currentPlaylistSongsRef.current = currentPlaylistSongs;
  }, [currentPlaylistSongs]);

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
      const currentSource = audioSourceRef.current;
      const allSongs = historyRef.current;
      const playlistSongs = currentPlaylistSongsRef.current;

      if (!currentSource || queue.length === 0) {
        setIsPlaying(false);
        setAudioSource(null);
        setCurrentTime(0);
        return;
      }

      // Determine which list to use based on which list is current song from
      let songsToSearch = allSongs;
      const isFromPlaylist = playlistSongs && playlistSongs.some(s => s.id === currentSource.id);
      if (isFromPlaylist) {
        songsToSearch = playlistSongs;
      }

      const currentIndex = queue.indexOf(currentSource.id);

      // Find next valid song (skip deleted songs)
      for (let i = currentIndex + 1; i < queue.length; i++) {
        const nextId = queue[i];
        const nextSong = songsToSearch.find((s) => s.id === nextId);
        const nextUrl = nextSong?.sunoLocalUrl || nextSong?.sunoAudioUrl;

        if (nextSong && nextUrl) {
          setAudioSource({ id: nextSong.id, url: nextUrl });
          return;
        }
      }

      // If from playlist and end of queue, wrap to start
      if (isFromPlaylist) {
        for (let i = 0; i < currentIndex; i++) {
          const nextId = queue[i];
          const nextSong = songsToSearch.find((s) => s.id === nextId);
          const nextUrl = nextSong?.sunoLocalUrl || nextSong?.sunoAudioUrl;

          if (nextSong && nextUrl) {
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

  const setNowPlaying = (item: HistoryItem | null) => {
    if (!item) {
      setAudioSource(null);
      return;
    }
    const url = item.sunoLocalUrl || item.sunoAudioUrl;
    if (url) {
      // Determine which list to use for playback queue based on where the song is playing from
      // Prefer playlist if song exists there (even with duplicates)
      let songsToQueue = filteredHistory;

      if (currentPlaylistSongs && currentPlaylistSongs.some(s => s.id === item.id)) {
        songsToQueue = currentPlaylistSongs;
      }

      setPlaybackQueue(songsToQueue.map((h) => h.id));
      setAudioSource({ id: item.id, url });
    }
  };

  const getSongsToSearch = () => {
    if (!nowPlaying) return history;
    if (currentPlaylistSongs && currentPlaylistSongs.some(s => s.id === nowPlaying.id)) {
      return currentPlaylistSongs;
    }
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
  };
}

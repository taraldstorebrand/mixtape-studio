import { useEffect, useRef } from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import {
  audioSourceAtom,
  nowPlayingAtom,
  audioRefAtom,
  isPlayingAtom,
  currentTimeAtom,
  durationAtom,
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
  const [playbackQueue, setPlaybackQueue] = useAtom(playbackQueueAtom);
  const history = useAtomValue(historyAtom);
  const internalAudioRef = useRef<HTMLAudioElement>(null);

  // Refs to avoid stale closures in event handlers
  const playbackQueueRef = useRef(playbackQueue);
  const historyRef = useRef(history);
  const audioSourceRef = useRef(audioSource);

  useEffect(() => {
    playbackQueueRef.current = playbackQueue;
  }, [playbackQueue]);

  useEffect(() => {
    historyRef.current = history;
  }, [history]);

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

      if (!currentSource || queue.length === 0) {
        setIsPlaying(false);
        setAudioSource(null);
        setCurrentTime(0);
        return;
      }

      const currentIndex = queue.indexOf(currentSource.id);
      
      // Find next valid song (skip deleted songs)
      for (let i = currentIndex + 1; i < queue.length; i++) {
        const nextId = queue[i];
        const nextSong = allSongs.find((s) => s.id === nextId);
        const nextUrl = nextSong?.sunoLocalUrl || nextSong?.sunoAudioUrl;
        
        if (nextSong && nextUrl) {
          setAudioSource({ id: nextSong.id, url: nextUrl });
          return;
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
      // Capture current filtered list as playback queue (D-052)
      setPlaybackQueue(filteredHistory.map((h) => h.id));
      setAudioSource({ id: item.id, url });
    }
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
  };
}

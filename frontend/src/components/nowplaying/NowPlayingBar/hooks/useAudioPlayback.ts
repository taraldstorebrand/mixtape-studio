import { useEffect, useRef } from 'react';
import { useAtom } from 'jotai';
import {
  nowPlayingAtom,
  audioRefAtom,
  isPlayingAtom,
  currentTimeAtom,
  durationAtom,
} from '../../../../store';

export function useAudioPlayback() {
  const [nowPlaying, setNowPlaying] = useAtom(nowPlayingAtom);
  const [, setAudioRef] = useAtom(audioRefAtom);
  const [isPlaying, setIsPlaying] = useAtom(isPlayingAtom);
  const [currentTime, setCurrentTime] = useAtom(currentTimeAtom);
  const [duration, setDuration] = useAtom(durationAtom);
  const internalAudioRef = useRef<HTMLAudioElement>(null);

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
      setIsPlaying(false);
      setNowPlaying(null);
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
      setNowPlaying(null);
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
  }, [setCurrentTime, setDuration, setIsPlaying, setNowPlaying]);

  // Load audio when nowPlaying changes
  useEffect(() => {
    const audio = internalAudioRef.current;
    if (!audio) return;

    if (!nowPlaying) {
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
      setCurrentTime(0);
      setDuration(0);
      setIsPlaying(false);
      return;
    }

    const audioUrl = nowPlaying.sunoLocalUrl || nowPlaying.sunoAudioUrl;
    if (!audioUrl) return;

    audio.pause();
    setCurrentTime(0);
    setDuration(0);
    audio.src = audioUrl;
    audio.load();
    audio.play().catch((error) => {
      console.error('Failed to play audio:', error);
      setIsPlaying(false);
    });
  }, [nowPlaying, setIsPlaying, setCurrentTime, setDuration]);

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

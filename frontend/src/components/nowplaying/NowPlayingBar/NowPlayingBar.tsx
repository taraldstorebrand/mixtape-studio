import { useEffect, useRef, useState } from 'react';
import { useAtom } from 'jotai';
import {
  nowPlayingAtom,
  audioRefAtom,
  isPlayingAtom,
  currentTimeAtom,
  durationAtom,
} from '../../../store';
import { t } from '../../../i18n';
import styles from './NowPlayingBar.module.css';

export function NowPlayingBar() {
  const [nowPlaying, setNowPlaying] = useAtom(nowPlayingAtom);
  const [audioRef, setAudioRef] = useAtom(audioRefAtom);
  const [isPlaying, setIsPlaying] = useAtom(isPlayingAtom);
  const [currentTime, setCurrentTime] = useAtom(currentTimeAtom);
  const [duration, setDuration] = useAtom(durationAtom);
  const internalAudioRef = useRef<HTMLAudioElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragTime, setDragTime] = useState(0);
  const isDraggingRef = useRef(false);
  const dragTimeRef = useRef(0);

  // Initialize audio ref
  useEffect(() => {
    if (internalAudioRef.current && !audioRef) {
      setAudioRef(internalAudioRef.current);
    }
  }, [audioRef, setAudioRef]);

  // Handle audio events
  useEffect(() => {
    const audio = internalAudioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      if (!isDraggingRef.current) {
        setCurrentTime(audio.currentTime);
      }
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

  const handlePlayPause = () => {
    const audio = internalAudioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch((error) => {
        console.error('Failed to play audio:', error);
        setIsPlaying(false);
      });
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = internalAudioRef.current;
    if (!audio || !duration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * duration;

    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleProgressKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const audio = internalAudioRef.current;
    if (!audio || !duration) return;

    const step = 5;
    let newTime = currentTime;

    switch (e.key) {
      case 'ArrowLeft':
        newTime = Math.max(0, currentTime - step);
        break;
      case 'ArrowRight':
        newTime = Math.min(duration, currentTime + step);
        break;
      case 'Home':
        newTime = 0;
        break;
      case 'End':
        newTime = duration;
        break;
      default:
        return;
    }

    e.preventDefault();
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleProgressMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    isDraggingRef.current = true;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    const newDragTime = percentage * duration;
    setDragTime(newDragTime);
    dragTimeRef.current = newDragTime;
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const progressBar = progressBarRef.current;
      if (!progressBar) return;

      const rect = progressBar.getBoundingClientRect();
      const moveX = e.clientX - rect.left;
      const percentage = Math.max(0, Math.min(1, moveX / rect.width));
      const newDragTime = percentage * duration;
      setDragTime(newDragTime);
      dragTimeRef.current = newDragTime;
    };

    const handleMouseUp = () => {
      const audio = internalAudioRef.current;
      if (audio) {
        audio.currentTime = dragTimeRef.current;
        setCurrentTime(dragTimeRef.current);
      }
      setIsDragging(false);
      isDraggingRef.current = false;
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, duration, setCurrentTime]);

  const formatTime = (seconds: number): string => {
    if (!isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  const displayTime = isDragging ? dragTime : currentTime;
  const progress = duration > 0 ? (displayTime / duration) * 100 : 0;

  const displayTitle = nowPlaying?.title || nowPlaying?.prompt || t.messages.untitled;
  const variationLabel = nowPlaying?.variationIndex !== undefined ? ` #${nowPlaying.variationIndex + 1}` : '';

  return (
    <>
      <audio ref={internalAudioRef} />
      {nowPlaying && (
        <div className={styles.nowPlayingBar}>
        <div className={styles.content}>
          <img
            src={nowPlaying.sunoImageUrl || '/assets/placeholder.png'}
            alt=""
            className={styles.thumbnail}
          />
          <div className={styles.info}>
            <div className={styles.title}>
              {displayTitle}{variationLabel}
            </div>
          </div>
          <button
            className={styles.playButton}
            onClick={handlePlayPause}
            title={isPlaying ? 'Pause' : 'Play'}
            aria-label={isPlaying ? 'Pause' : 'Play'}
            aria-pressed={isPlaying}
          >
            {isPlaying ? '⏸' : '▶'}
          </button>
          <div className={styles.progressContainer}>
            <span className={styles.time}>{formatTime(displayTime)}</span>
            <div
              ref={progressBarRef}
              className={styles.progressBar}
              onClick={handleProgressClick}
              onMouseDown={handleProgressMouseDown}
              onKeyDown={handleProgressKeyDown}
              role="slider"
              tabIndex={0}
              aria-label="Seek"
              aria-valuemin={0}
              aria-valuemax={Math.round(duration)}
              aria-valuenow={Math.round(displayTime)}
            >
              <div
                className={styles.progressFill}
                style={{ width: `${progress}%` }}
              />
              <div
                className={styles.progressHandle}
                style={{ left: `${progress}%` }}
              />
            </div>
            <span className={styles.time}>{formatTime(duration)}</span>
          </div>
        </div>
      </div>
      )}
    </>
  );
}

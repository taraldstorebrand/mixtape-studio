import { useEffect, useRef, useState } from 'react';
import styles from '../NowPlayingBar.module.css';

interface ProgressBarProps {
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
}

export function ProgressBar({ currentTime, duration, onSeek }: ProgressBarProps) {
  const progressBarRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragTime, setDragTime] = useState(0);
  const isDraggingRef = useRef(false);
  const dragTimeRef = useRef(0);

  const displayTime = isDragging ? dragTime : currentTime;
  const progress = duration > 0 ? (displayTime / duration) * 100 : 0;

  const formatTime = (seconds: number): string => {
    if (!isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!duration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * duration;

    onSeek(newTime);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!duration) return;

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
    onSeek(newTime);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
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
      const bar = progressBarRef.current;
      if (!bar) return;

      const rect = bar.getBoundingClientRect();
      const moveX = e.clientX - rect.left;
      const percentage = Math.max(0, Math.min(1, moveX / rect.width));
      const newDragTime = percentage * duration;
      setDragTime(newDragTime);
      dragTimeRef.current = newDragTime;
    };

    const handleMouseUp = () => {
      onSeek(dragTimeRef.current);
      setIsDragging(false);
      isDraggingRef.current = false;
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, duration, onSeek]);

  return (
    <div className={styles.progressContainer}>
      <span className={styles.time}>{formatTime(displayTime)}</span>
      <div
        ref={progressBarRef}
        className={styles.progressBar}
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        onKeyDown={handleKeyDown}
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
  );
}

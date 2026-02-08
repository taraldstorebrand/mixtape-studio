import { useEffect, useRef, useState } from 'react';
import { useVolumeAtom } from '../../../../store/useVolumeAtom';
import styles from '../NowPlayingBar.module.css';

interface VolumeControlProps {
  audioRef: React.RefObject<HTMLAudioElement | null>;
}

export function VolumeControl({ audioRef }: VolumeControlProps) {
  const { volume, setVolume } = useVolumeAtom();
  const volumeBarRef = useRef<HTMLDivElement>(null);
  const [isVolumeDragging, setIsVolumeDragging] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const previousVolumeRef = useRef(1.0);

  // Sync audio element volume
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = isMuted ? 0 : volume;
  }, [volume, isMuted, audioRef]);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    setVolume(percentage);
    if (percentage > 0) setIsMuted(false);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsVolumeDragging(true);
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    setVolume(percentage);
    if (percentage > 0) setIsMuted(false);
  };

  useEffect(() => {
    if (!isVolumeDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const bar = volumeBarRef.current;
      if (!bar) return;

      const rect = bar.getBoundingClientRect();
      const moveX = e.clientX - rect.left;
      const percentage = Math.max(0, Math.min(1, moveX / rect.width));
      setVolume(percentage);
      if (percentage > 0) setIsMuted(false);
    };

    const handleMouseUp = () => {
      setIsVolumeDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isVolumeDragging, setVolume]);

  const handleMuteToggle = () => {
    if (isMuted) {
      setIsMuted(false);
      if (volume === 0) {
        setVolume(previousVolumeRef.current);
      }
    } else {
      previousVolumeRef.current = volume > 0 ? volume : 1.0;
      setIsMuted(true);
    }
  };

  const displayVolume = isMuted ? 0 : volume;

  return (
    <div className={styles.volumeContainer}>
      <button
        className={styles.muteButton}
        onClick={handleMuteToggle}
        title={isMuted ? 'Unmute' : 'Mute'}
        aria-label={isMuted ? 'Unmute' : 'Mute'}
        aria-pressed={isMuted}
      >
        {isMuted || volume === 0 ? '🔇' : volume < 0.5 ? '🔉' : '🔊'}
      </button>
      <div
        ref={volumeBarRef}
        className={styles.volumeBar}
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        role="slider"
        tabIndex={0}
        aria-label="Volume"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(displayVolume * 100)}
      >
        <div
          className={styles.volumeFill}
          style={{ width: `${displayVolume * 100}%` }}
        />
        <div
          className={styles.volumeHandle}
          style={{ left: `${displayVolume * 100}%` }}
        />
      </div>
    </div>
  );
}

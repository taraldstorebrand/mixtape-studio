import { useAtomValue } from 'jotai';
import { useEffect, useRef, useState } from 'react';
import { playbackQueueAtom, useHistoryAtom } from '../../../store';
import { useAudioPlayback } from './hooks/useAudioPlayback';
import { ProgressBar } from './ProgressBar/ProgressBar';
import { VolumeControl } from './VolumeControl/VolumeControl';
import { t } from '../../../i18n';
import styles from './NowPlayingBar.module.css';

export function NowPlayingBar() {
  const {
    audioRef,
    nowPlaying,
    setNowPlaying,
    isPlaying,
    currentTime,
    duration,
    togglePlayPause,
    seek,
    getSongsToSearch,
  } = useAudioPlayback();

  const playbackQueue = useAtomValue(playbackQueueAtom);
  const { handleFeedback } = useHistoryAtom();

  const titleRef = useRef<HTMLDivElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  const handlePrevious = () => {
    // Standard behavior: if >3s into song, restart; otherwise go to previous
    const time = Number.isFinite(currentTime) ? currentTime : 0;
    if (time > 3) {
      seek(0);
      return;
    }

    if (playbackQueue.length === 0) return;

    const currentIndex = nowPlaying
      ? playbackQueue.indexOf(nowPlaying.id)
      : -1;

    const songsToSearch = getSongsToSearch();

    // Find previous valid song (skip deleted songs)
    for (let i = currentIndex - 1; i >= 0; i--) {
      const prevId = playbackQueue[i];
      const prevSong = songsToSearch.find((s) => s.id === prevId);
      const prevUrl = prevSong?.sunoLocalUrl || prevSong?.sunoAudioUrl;
      if (prevSong && prevUrl) {
        setNowPlaying(prevSong);
        return;
      }
    }

    // Wrap to end of queue, find last valid song
    for (let i = playbackQueue.length - 1; i > currentIndex; i--) {
      const prevId = playbackQueue[i];
      const prevSong = songsToSearch.find((s) => s.id === prevId);
      const prevUrl = prevSong?.sunoLocalUrl || prevSong?.sunoAudioUrl;
      if (prevSong && prevUrl) {
        setNowPlaying(prevSong);
        return;
      }
    }

    // No valid songs found - stay on current or stop
  };

  const handleNext = () => {
    if (playbackQueue.length === 0) return;

    const currentIndex = nowPlaying
      ? playbackQueue.indexOf(nowPlaying.id)
      : -1;

    const songsToSearch = getSongsToSearch();

    // Find next valid song (skip deleted songs)
    for (let i = currentIndex + 1; i < playbackQueue.length; i++) {
      const nextId = playbackQueue[i];
      const nextSong = songsToSearch.find((s) => s.id === nextId);
      const nextUrl = nextSong?.sunoLocalUrl || nextSong?.sunoAudioUrl;
      if (nextSong && nextUrl) {
        setNowPlaying(nextSong);
        return;
      }
    }

    // Wrap to start of queue, find first valid song
    for (let i = 0; i < currentIndex; i++) {
      const nextId = playbackQueue[i];
      const nextSong = songsToSearch.find((s) => s.id === nextId);
      const nextUrl = nextSong?.sunoLocalUrl || nextSong?.sunoAudioUrl;
      if (nextSong && nextUrl) {
        setNowPlaying(nextSong);
        return;
      }
    }

    // No valid songs found - stay on current or stop
  };

  const displayTitle = nowPlaying?.title || nowPlaying?.prompt || t.messages.untitled;
  const variationLabel = nowPlaying?.variationIndex !== undefined ? ` #${nowPlaying.variationIndex + 1}` : '';

  useEffect(() => {
    const checkOverflow = () => {
      const el = titleRef.current;
      if (!el) return;
      
      const overflow = el.scrollWidth - el.clientWidth;
      if (overflow > 0) {
        el.style.setProperty('--marquee-distance', `-${overflow}px`);
        setIsOverflowing(true);
      } else {
        setIsOverflowing(false);
      }
    };

    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [nowPlaying?.id, displayTitle, variationLabel]);

  return (
    <>
      <audio ref={audioRef} />
      {nowPlaying && (
        <div className={styles.nowPlayingBar}>
          <div className={styles.content}>
            <div className={styles.leftSection}>
              <img
                src={nowPlaying.sunoImageUrl || '/assets/placeholder.png'}
                alt=""
                className={styles.thumbnail}
              />
              <div className={styles.info}>
                <div
                  ref={titleRef}
                  className={`${styles.title} ${isOverflowing ? styles.titleMarquee : ''}`}
                >
                  {isOverflowing ? (
                    <span>{displayTitle}{variationLabel}</span>
                  ) : (
                    <>{displayTitle}{variationLabel}</>
                  )}
                </div>
              </div>
            </div>
            <div className={styles.centerSection}>
              <div className={styles.controls}>
                <button
                  type="button"
                  className={styles.navButton}
                  onClick={handlePrevious}
                  disabled={playbackQueue.length === 0}
                  title={t.tooltips.previous}
                  aria-label={t.tooltips.previous}
                >
                  ⏮
                </button>
                <button
                  type="button"
                  className={`${styles.playButton} ${isPlaying ? styles.playButtonPause : styles.playButtonPlay}`}
                  onClick={togglePlayPause}
                  title={isPlaying ? t.tooltips.pause : t.tooltips.play}
                  aria-label={isPlaying ? t.tooltips.pause : t.tooltips.play}
                  aria-pressed={isPlaying}
                >
                  {isPlaying ? '⏸' : '▶'}
                </button>
                <button
                  type="button"
                  className={styles.navButton}
                  onClick={handleNext}
                  disabled={playbackQueue.length === 0}
                  title={t.tooltips.next}
                  aria-label={t.tooltips.next}
                >
                  ⏭
                </button>
              </div>
              <ProgressBar
                currentTime={currentTime}
                duration={duration}
                onSeek={seek}
              />
            </div>
            <div className={styles.rightSection}>
              <div className={styles.feedbackButtons}>
                <button
                  type="button"
                  onClick={() => handleFeedback(nowPlaying.id, nowPlaying.feedback === 'up' ? null : 'up')}
                  className={`${styles.thumbButton} ${nowPlaying.feedback === 'up' ? styles.thumbButtonActive : ''}`}
                  title={t.tooltips.thumbsUp}
                  aria-label={t.tooltips.thumbsUp}
                  aria-pressed={nowPlaying.feedback === 'up'}
                >
                  👍
                </button>
                <button
                  type="button"
                  onClick={() => handleFeedback(nowPlaying.id, nowPlaying.feedback === 'down' ? null : 'down')}
                  className={`${styles.thumbButton} ${nowPlaying.feedback === 'down' ? styles.thumbButtonActive : ''}`}
                  title={t.tooltips.thumbsDown}
                  aria-label={t.tooltips.thumbsDown}
                  aria-pressed={nowPlaying.feedback === 'down'}
                >
                  👎
                </button>
              </div>
              <VolumeControl audioRef={audioRef} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

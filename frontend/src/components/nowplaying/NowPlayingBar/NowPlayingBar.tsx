import { useAtomValue } from 'jotai';
import { useEffect, useRef, useState } from 'react';
import { filteredHistoryAtom, useHistoryAtom } from '../../../store';
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
  } = useAudioPlayback();

  const filteredHistory = useAtomValue(filteredHistoryAtom);
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

    if (filteredHistory.length === 0) return;

    const currentIndex = nowPlaying
      ? filteredHistory.findIndex(item => item.id === nowPlaying.id)
      : -1;

    let previousIndex: number;
    if (currentIndex === -1 || currentIndex === 0) {
      previousIndex = filteredHistory.length - 1;
    } else {
      previousIndex = currentIndex - 1;
    }

    setNowPlaying(filteredHistory[previousIndex]);
  };

  const handleNext = () => {
    if (filteredHistory.length === 0) return;

    const currentIndex = nowPlaying
      ? filteredHistory.findIndex(item => item.id === nowPlaying.id)
      : -1;

    let nextIndex: number;
    if (currentIndex === -1 || currentIndex === filteredHistory.length - 1) {
      nextIndex = 0;
    } else {
      nextIndex = currentIndex + 1;
    }

    setNowPlaying(filteredHistory[nextIndex]);
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
                  {displayTitle}{variationLabel}
                </div>
              </div>
            </div>
            <div className={styles.centerSection}>
              <div className={styles.controls}>
                <button
                  type="button"
                  className={styles.navButton}
                  onClick={handlePrevious}
                  disabled={filteredHistory.length === 0}
                  title={t.tooltips.previous}
                  aria-label={t.tooltips.previous}
                >
                  ⏮
                </button>
                <button
                  type="button"
                  className={styles.playButton}
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
                  disabled={filteredHistory.length === 0}
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

import { useAtomValue } from 'jotai';
import { filteredHistoryAtom } from '../../../store';
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

  const handlePrevious = () => {
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

  return (
    <>
      <audio ref={audioRef} />
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
            <div className={styles.controls}>
              <button
                className={styles.navButton}
                onClick={handlePrevious}
                disabled={filteredHistory.length === 0}
                title="Previous"
                aria-label="Previous"
              >
                ⏮
              </button>
              <button
                className={styles.playButton}
                onClick={togglePlayPause}
                title={isPlaying ? 'Pause' : 'Play'}
                aria-label={isPlaying ? 'Pause' : 'Play'}
                aria-pressed={isPlaying}
              >
                {isPlaying ? '⏸' : '▶'}
              </button>
              <button
                className={styles.navButton}
                onClick={handleNext}
                disabled={filteredHistory.length === 0}
                title="Next"
                aria-label="Next"
              >
                ⏭
              </button>
            </div>
            <ProgressBar
              currentTime={currentTime}
              duration={duration}
              onSeek={seek}
            />
            <VolumeControl audioRef={audioRef} />
          </div>
        </div>
      )}
    </>
  );
}

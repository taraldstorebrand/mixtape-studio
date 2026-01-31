import { useAtomValue, useSetAtom } from 'jotai';
import { useEffect, useRef, useState } from 'react';
import { HistoryItem as HistoryItemType } from '../../../types';
import { t } from '../../../i18n';
import { nowPlayingAtom, audioSourceAtom, audioRefAtom, isPlayingAtom, filteredHistoryAtom, playbackQueueAtom } from '../../../store';
import styles from './HistoryItem.module.css';

interface HistoryItemProps {
  item: HistoryItemType;
  isSelected: boolean;
  onFeedback: (id: string, feedback: 'up' | 'down' | null) => void;
  onSelect: (item: HistoryItemType) => void;
  onDelete: () => void;
}

function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return '0:00';
  }
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function HistoryItem({ item, isSelected, onFeedback, onSelect, onDelete }: HistoryItemProps) {
  const displayTitle = item.title || item.prompt || t.messages.untitled;
  const variationLabel = item.variationIndex !== undefined ? ` #${item.variationIndex + 1}` : '';
  const audioUrl = item.sunoLocalUrl || item.sunoAudioUrl;

  const nowPlaying = useAtomValue(nowPlayingAtom);
  const setAudioSource = useSetAtom(audioSourceAtom);
  const audioRef = useAtomValue(audioRefAtom);
  const isPlaying = useAtomValue(isPlayingAtom);
  const filteredHistory = useAtomValue(filteredHistoryAtom);
  const setPlaybackQueue = useSetAtom(playbackQueueAtom);

  const isCurrentlyPlaying = nowPlaying?.id === item.id && isPlaying;

  const titleRef = useRef<HTMLElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

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
  }, [item.id, displayTitle, variationLabel]);

  const handlePlayPause = () => {
    if (!audioUrl) return;

    if (nowPlaying?.id === item.id) {
      // Same song - toggle play/pause
      if (isPlaying && audioRef) {
        audioRef.pause();
      } else if (audioRef) {
        audioRef.play().catch((error) => {
          console.error('Failed to play audio:', error);
        });
      }
    } else {
      // Different song - switch to this one and update playback queue (D-052)
      setPlaybackQueue(filteredHistory.map((h) => h.id));
      setAudioSource({ id: item.id, url: audioUrl });
    }
  };

  const handleClick = (e: React.MouseEvent | React.KeyboardEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button')) {
      return;
    }
    if (isSelected) {
      return;
    }
    onSelect(item);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick(e);
    }
  };

  if (item.sunoStatus === 'pending' && !audioUrl) {
    return (
      <div
        className={styles.skeletonHistoryItem}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        aria-label={t.messages.untitled}
      >
        <div className={`${styles.skeleton} ${styles.skeletonThumbnail}`} />
        <div className={styles.skeletonContent}>
          <div className={`${styles.skeleton} ${styles.skeletonTitle}`} />
          <div className={`${styles.skeleton} ${styles.skeletonBadge}`} />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${styles.historyItem} ${isSelected ? styles.selected : ''} ${isCurrentlyPlaying ? styles.nowPlaying : ''}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`${displayTitle}${variationLabel}`}
    >
      <div className={styles.historyHeader}>
        <div className={styles.thumbnailWrapper}>
          <img
            src={item.sunoImageUrl || '/assets/placeholder.png'}
            alt=""
            className={styles.historyThumbnail}
          />
          {audioUrl && (
            <button
              type="button"
              onClick={handlePlayPause}
              className={`${styles.playButtonOverlay} ${isCurrentlyPlaying ? styles.playButtonOverlayActive : styles.playButtonOverlayPlay}`}
              title={isCurrentlyPlaying ? t.tooltips.pause : t.tooltips.play}
              aria-label={isCurrentlyPlaying ? t.tooltips.pause : t.tooltips.play}
              aria-pressed={isCurrentlyPlaying}
            >
              {isCurrentlyPlaying ? '⏸' : '▶'}
            </button>
          )}
        </div>
        <div className={styles.historyMeta}>
          <div className={styles.titleWithDuration}>
            <strong
              ref={titleRef}
              className={`${styles.historyTitle} ${isOverflowing ? styles.historyTitleMarquee : ''}`}
            >
              {isOverflowing ? (
                <span>{displayTitle}{variationLabel}</span>
              ) : (
                <>{displayTitle}{variationLabel}</>
              )}
            </strong>
            {item.duration && <span className={styles.durationLabel}>{formatDuration(item.duration)}</span>}
          </div>
          {item.sunoStatus === 'failed' && <span className={`${styles.statusBadge} ${styles.statusFailed}`}>{t.messages.failed}</span>}
          <div className={styles.dateWrapper}>
            {item.isUploaded && (
              <span className={styles.uploadedIcon} title={t.messages.uploaded} aria-label={t.messages.uploaded}>
                ⬆
              </span>
            )}
            <span className={styles.historyDate}>
              {new Date(item.createdAt).toLocaleString('no-NO', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        </div>
        <div className={styles.historyActions}>
          <div className={styles.feedbackButtons}>
            <button
              type="button"
              onClick={() => onFeedback(item.id, item.feedback === 'up' ? null : 'up')}
              className={`${styles.thumbButton} ${item.feedback === 'up' ? styles.thumbButtonActive : ''}`}
              title={t.tooltips.thumbsUp}
              aria-label={t.tooltips.thumbsUp}
            >
              👍
            </button>
            <button
              type="button"
              onClick={() => onFeedback(item.id, item.feedback === 'down' ? null : 'down')}
              className={`${styles.thumbButton} ${item.feedback === 'down' ? styles.thumbButtonActive : ''}`}
              title={t.tooltips.thumbsDown}
              aria-label={t.tooltips.thumbsDown}
            >
              👎
            </button>
          </div>
          <button
            type="button"
            onClick={onDelete}
            className={styles.deleteButton}
            title={t.tooltips.delete}
            aria-label={t.tooltips.delete}
          >
            🗑
          </button>
        </div>
      </div>
    </div>
  );
}

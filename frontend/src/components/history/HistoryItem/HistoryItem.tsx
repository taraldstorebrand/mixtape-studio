import { useAtom } from 'jotai';
import { HistoryItem as HistoryItemType } from '../../../types';
import { t } from '../../../i18n';
import { nowPlayingAtom, audioRefAtom, isPlayingAtom } from '../../../store';
import styles from './HistoryItem.module.css';

interface HistoryItemProps {
  item: HistoryItemType;
  isSelected: boolean;
  onFeedback: (id: string, feedback: 'up' | 'down' | null) => void;
  onSelect: (item: HistoryItemType) => void;
  onDelete: () => void;
}

export function HistoryItem({ item, isSelected, onFeedback, onSelect, onDelete }: HistoryItemProps) {
  const displayTitle = item.title || item.prompt || t.messages.untitled;
  const variationLabel = item.variationIndex !== undefined ? ` #${item.variationIndex + 1}` : '';
  const audioUrl = item.sunoLocalUrl || item.sunoAudioUrl;

  const [nowPlaying, setNowPlaying] = useAtom(nowPlayingAtom);
  const [audioRef] = useAtom(audioRefAtom);
  const [isPlaying] = useAtom(isPlayingAtom);

  const isCurrentlyPlaying = nowPlaying?.id === item.id && isPlaying;

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
      // Different song - switch to this one
      setNowPlaying(item);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button')) {
      return;
    }
    onSelect(item);
  };

  if (item.sunoStatus === 'pending' && !audioUrl) {
    return (
      <div className={styles.skeletonHistoryItem} onClick={handleClick}>
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
    >
      <div className={styles.historyHeader}>
        <img
          src={item.sunoImageUrl || '/assets/placeholder.png'}
          alt=""
          className={styles.historyThumbnail}
        />
        <div className={styles.historyMeta}>
          <strong className={styles.historyTitle}>{displayTitle}{variationLabel}</strong>
          {item.sunoStatus === 'failed' && <span className={`${styles.statusBadge} ${styles.statusFailed}`}>{t.messages.failed}</span>}
          <span className={styles.historyDate}>
            {new Date(item.createdAt).toLocaleString('no-NO', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
            {item.isUploaded && <span className={styles.uploadedLabel}>{t.messages.uploaded}</span>}
          </span>
        </div>
        <div className={styles.historyActions}>
          {audioUrl && (
            <button
              onClick={handlePlayPause}
              className={`${styles.playButton} ${isCurrentlyPlaying ? styles.playButtonActive : ''}`}
              title={isCurrentlyPlaying ? 'Pause' : 'Play'}
              aria-label={isCurrentlyPlaying ? 'Pause' : 'Play'}
              aria-pressed={isCurrentlyPlaying}
            >
              {isCurrentlyPlaying ? '⏸' : '▶'}
            </button>
          )}
          <div className={styles.feedbackButtons}>
            <button
              onClick={() => onFeedback(item.id, item.feedback === 'up' ? null : 'up')}
              className={`${styles.thumbButton} ${item.feedback === 'up' ? styles.thumbButtonActive : ''}`}
              title={t.tooltips.thumbsUp}
              aria-label={t.tooltips.thumbsUp}
            >
              👍
            </button>
            <button
              onClick={() => onFeedback(item.id, item.feedback === 'down' ? null : 'down')}
              className={`${styles.thumbButton} ${item.feedback === 'down' ? styles.thumbButtonActive : ''}`}
              title={t.tooltips.thumbsDown}
              aria-label={t.tooltips.thumbsDown}
            >
              👎
            </button>
          </div>
          <button
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

import { useRef, useEffect } from 'react';
import { HistoryItem as HistoryItemType } from '../../../types';
import { t } from '../../../i18n';
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
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const el = audioRef.current;
    if (!el || !audioUrl) return;
    if (el.paused || !el.currentTime) {
      el.src = audioUrl;
      el.load();
    }
  }, [audioUrl]);

  const handleClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('audio')) {
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
      className={`${styles.historyItem} ${isSelected ? styles.selected : ''}`}
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
          <div className={styles.feedbackButtons}>
            <button
              onClick={() => onFeedback(item.id, item.feedback === 'up' ? null : 'up')}
              className={`${styles.thumbButton} ${item.feedback === 'up' ? styles.thumbButtonActive : ''}`}
              title={t.tooltips.thumbsUp}
            >
              👍
            </button>
            <button
              onClick={() => onFeedback(item.id, item.feedback === 'down' ? null : 'down')}
              className={`${styles.thumbButton} ${item.feedback === 'down' ? styles.thumbButtonActive : ''}`}
              title={t.tooltips.thumbsDown}
            >
              👎
            </button>
          </div>
          <button
            onClick={onDelete}
            className={styles.deleteButton}
            title={t.tooltips.delete}
          >
            🗑
          </button>
        </div>
      </div>
      {audioUrl && (
        <div className={styles.audioPreviews}>
          <div className={styles.audioPreview}>
            <audio ref={audioRef} controls />
          </div>
        </div>
      )}
    </div>
  );
}

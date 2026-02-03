import { useAtomValue, useSetAtom } from 'jotai';
import { useEffect, useRef, useState } from 'react';
import { HistoryItem as HistoryItemType } from '../../../types';
import { t } from '../../../i18n';
import { nowPlayingAtom, audioSourceAtom, audioRefAtom, isPlayingAtom, filteredHistoryAtom, playbackQueueAtom, currentPlaylistEntriesAtom, selectedQueueEntryIdAtom, currentQueueIndexAtom } from '../../../store';
import styles from './HistoryItem.module.css';

interface HistoryItemProps {
  item: HistoryItemType;
  entryId: string | null;
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

export function HistoryItem({ item, entryId, isSelected, onFeedback, onSelect, onDelete }: HistoryItemProps) {
  const displayTitle = item.title || item.prompt || t.messages.untitled;
  const variationLabel = item.variationIndex !== undefined ? ` #${item.variationIndex + 1}` : '';
  const audioUrl = item.sunoLocalUrl || item.sunoAudioUrl;

  const nowPlaying = useAtomValue(nowPlayingAtom);
  const setAudioSource = useSetAtom(audioSourceAtom);
  const audioRef = useAtomValue(audioRefAtom);
  const isPlaying = useAtomValue(isPlayingAtom);
  const filteredHistory = useAtomValue(filteredHistoryAtom);
  const currentPlaylistEntries = useAtomValue(currentPlaylistEntriesAtom);
  const setPlaybackQueue = useSetAtom(playbackQueueAtom);
  const setCurrentQueueIndex = useSetAtom(currentQueueIndexAtom);
  const selectedQueueEntryId = useAtomValue(selectedQueueEntryIdAtom);
  const setSelectedQueueEntryId = useSetAtom(selectedQueueEntryIdAtom);

  const isCurrentlyPlaying = nowPlaying?.id === item.id && isPlaying;
  const isEntrySelected = entryId ? entryId === selectedQueueEntryId : isSelected;
  const isThisEntryPlaying = entryId ? entryId === selectedQueueEntryId && isCurrentlyPlaying : isCurrentlyPlaying;

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

    // Check if this specific entry is already playing (handles duplicates in playlists)
    const isThisExactEntryPlaying = entryId
      ? entryId === selectedQueueEntryId && isPlaying
      : nowPlaying?.id === item.id && isPlaying;

    if (isThisExactEntryPlaying) {
      // Same entry - pause
      if (audioRef) {
        audioRef.pause();
      }
    } else if (nowPlaying?.id === item.id && !entryId) {
      // Same song in library mode (no entryId) - toggle play/pause
      if (isPlaying && audioRef) {
        audioRef.pause();
      } else if (audioRef) {
        audioRef.play().catch((error) => {
          console.error('Failed to play audio:', error);
        });
      }
    } else {
      // Different song or different entry - switch to this one and update playback queue
      if (currentPlaylistEntries) {
        // Playlist mode: use actual entry IDs and find correct index
        const newQueue = currentPlaylistEntries.map((e) => ({ entryId: e.entryId, songId: e.song.id }));
        const index = entryId
          ? newQueue.findIndex((q) => q.entryId === entryId)
          : newQueue.findIndex((q) => q.songId === item.id);
        setPlaybackQueue(newQueue);
        setCurrentQueueIndex(index >= 0 ? index : 0);
        setSelectedQueueEntryId(entryId ?? newQueue[index >= 0 ? index : 0]?.entryId ?? null);
      } else {
        // Library mode: generate entry IDs
        const newQueue = filteredHistory.map((h, i) => ({ entryId: `entry-${Date.now()}-${i}`, songId: h.id }));
        const index = newQueue.findIndex((q) => q.songId === item.id);
        setPlaybackQueue(newQueue);
        setCurrentQueueIndex(index >= 0 ? index : 0);
        setSelectedQueueEntryId(newQueue[index >= 0 ? index : 0]?.entryId ?? null);
      }
      setAudioSource({ id: item.id, url: audioUrl });
    }
  };

  const handleClick = (e: React.MouseEvent | React.KeyboardEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button')) {
      return;
    }
    if (isEntrySelected) {
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
      className={`${styles.historyItem} ${isEntrySelected ? styles.selected : ''} ${isThisEntryPlaying ? styles.nowPlaying : ''}`}
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
              className={`${styles.playButtonOverlay} ${isThisEntryPlaying ? styles.playButtonOverlayActive : styles.playButtonOverlayPlay}`}
              title={isThisEntryPlaying ? t.tooltips.pause : t.tooltips.play}
              aria-label={isThisEntryPlaying ? t.tooltips.pause : t.tooltips.play}
              aria-pressed={isThisEntryPlaying}
            >
              {isThisEntryPlaying ? '⏸' : '▶'}
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

import type { HistoryItem } from '../../../../types';
import { t } from '../../../../i18n';
import styles from '../SongPicker.module.css';

interface SongPickerItemProps {
  song: HistoryItem;
  onAdd: () => void;
}

function formatDuration(seconds?: number): string {
  if (!seconds) return '';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

export function SongPickerItem({ song, onAdd }: SongPickerItemProps) {
  const displayTitle = song.title || song.prompt || t.messages.untitled;
  const variationLabel = song.variationIndex !== undefined ? ` #${song.variationIndex + 1}` : '';
  const isLiked = song.feedback === 'up';

  return (
    <div className={styles.songItem}>
      <img
        src={song.sunoImageUrl || '/assets/placeholder.png'}
        alt=""
        className={styles.thumbnail}
      />
      <div className={styles.songInfo}>
        <span className={styles.songTitle} title={`${displayTitle}${variationLabel}`}>
          {displayTitle}{variationLabel}
          {isLiked && <span className={styles.likedBadge}>♥</span>}
        </span>
        {song.duration && (
          <span className={styles.songDuration}>{formatDuration(song.duration)}</span>
        )}
      </div>
      <button
        type="button"
        className={styles.addButton}
        onClick={onAdd}
        title={t.tooltips.addToMixtape}
        aria-label={`Add ${displayTitle} to mixtape`}
      >
        +
      </button>
    </div>
  );
}

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { t } from '../../../i18n';
import type { HistoryItem } from '../../../types';
import styles from './PlaylistEditor.module.css';

export interface PlaylistSongEntry {
  entryId: string;
  position: number;
  song: HistoryItem;
}

interface SortablePlaylistItemProps {
  entry: PlaylistSongEntry;
  index: number;
  onRemove: (entryId: string) => void;
  disabled?: boolean;
}

export function SortablePlaylistItem({ entry, index, onRemove, disabled }: SortablePlaylistItemProps) {
  const { song, entryId } = entry;
  const displayTitle = song.title || song.prompt || t.messages.untitled;
  const variationLabel = song.variationIndex !== undefined ? ` #${song.variationIndex + 1}` : '';

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: entryId, disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${styles.playlistItem} ${isDragging ? styles.dragging : ''}`}
    >
      <span
        className={styles.dragHandle}
        {...attributes}
        {...listeners}
        title={t.tooltips.dragToReorder}
      >
        ⋮⋮
      </span>
      <span className={styles.itemNumber}>{index + 1}</span>
      <img
        src={song.sunoImageUrl || '/assets/placeholder.png'}
        alt=""
        className={styles.itemThumbnail}
      />
      <span className={styles.itemTitle} title={`${displayTitle}${variationLabel}`}>
        {displayTitle}{variationLabel}
      </span>
      <button
        type="button"
        className={styles.removeButton}
        onClick={() => onRemove(entryId)}
        disabled={disabled}
        title={t.tooltips.remove}
        aria-label={`Remove ${displayTitle} from playlist`}
      >
        ×
      </button>
    </div>
  );
}

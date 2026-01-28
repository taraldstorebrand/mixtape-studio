import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { HistoryItem } from '../../../../types';
import styles from '../MixtapeEditor.module.css';

export interface MixtapeSong {
  id: string;
  song: HistoryItem;
}

interface SortableMixtapeItemProps {
  item: MixtapeSong;
  index: number;
  onRemove: () => void;
  disabled?: boolean;
}

export function SortableMixtapeItem({ item, index, onRemove, disabled }: SortableMixtapeItemProps) {
  const { song } = item;
  const displayTitle = song.title || song.prompt || 'Uten tittel';
  const variationLabel = song.variationIndex !== undefined ? ` #${song.variationIndex + 1}` : '';

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id, disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${styles.mixtapeItem} ${isDragging ? styles.dragging : ''}`}
    >
      <span
        className={styles.dragHandle}
        {...attributes}
        {...listeners}
        title="Dra for å endre rekkefølge"
      >
        ⋮⋮
      </span>
      <span className={styles.itemNumber}>{index + 1}</span>
      <img
        src={song.sunoImageUrl || '/assets/placeholder.png'}
        alt=""
        className={styles.itemThumbnail}
      />
      <span className={styles.itemTitle}>
        {displayTitle}{variationLabel}
      </span>
      <button
        type="button"
        className={styles.removeButton}
        onClick={onRemove}
        disabled={disabled}
        title="Fjern fra mixtape"
        aria-label={`Fjern ${displayTitle} fra mixtape`}
      >
        ×
      </button>
    </div>
  );
}

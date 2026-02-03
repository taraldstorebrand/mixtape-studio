import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useAtomValue, useSetAtom } from 'jotai';
import { t } from '../../../i18n';
import type { HistoryItem } from '../../../types';
import { nowPlayingAtom, audioSourceAtom, audioRefAtom, isPlayingAtom, playbackQueueAtom, selectedQueueEntryIdAtom, currentQueueIndexAtom } from '../../../store';
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
  allEntries: PlaylistSongEntry[];
}

export function SortablePlaylistItem({ entry, index, onRemove, disabled, allEntries }: SortablePlaylistItemProps) {
  const { song, entryId } = entry;
  const displayTitle = song.title || song.prompt || t.messages.untitled;
  const variationLabel = song.variationIndex !== undefined ? ` #${song.variationIndex + 1}` : '';
  const audioUrl = song.sunoLocalUrl || song.sunoAudioUrl;

  const nowPlaying = useAtomValue(nowPlayingAtom);
  const setAudioSource = useSetAtom(audioSourceAtom);
  const audioRef = useAtomValue(audioRefAtom);
  const isPlaying = useAtomValue(isPlayingAtom);
  const setPlaybackQueue = useSetAtom(playbackQueueAtom);
  const setCurrentQueueIndex = useSetAtom(currentQueueIndexAtom);
  const selectedQueueEntryId = useAtomValue(selectedQueueEntryIdAtom);
  const setSelectedQueueEntryId = useSetAtom(selectedQueueEntryIdAtom);

  const isCurrentlyPlaying = nowPlaying?.id === song.id && isPlaying;
  const isThisEntryPlaying = entryId === selectedQueueEntryId && isCurrentlyPlaying;

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

  const handlePlayPause = () => {
    if (!audioUrl) return;

    if (nowPlaying?.id === song.id) {
      if (isPlaying && audioRef) {
        audioRef.pause();
      } else if (audioRef) {
        audioRef.play().catch((error) => {
          console.error('Failed to play audio:', error);
        });
      }
      } else {
        setPlaybackQueue(allEntries.map((e) => ({ entryId: e.entryId, songId: e.song.id })));
        setCurrentQueueIndex(index);
        setSelectedQueueEntryId(entryId);
        setAudioSource({ id: song.id, url: audioUrl });
      }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${styles.playlistItem} ${isDragging ? styles.dragging : ''} ${isThisEntryPlaying ? styles.nowPlaying : ''}`}
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
      <div className={styles.thumbnailWrapper}>
        <img
          src={song.sunoImageUrl || '/assets/placeholder.png'}
          alt=""
          className={styles.itemThumbnail}
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

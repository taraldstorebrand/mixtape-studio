import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import type { HistoryItem } from '../../../types';
import { SongPicker } from '../SongPicker';
import { SortableMixtapeItem, type MixtapeSong } from './SortableMixtapeItem';
import { useMixtapeCreation } from './useMixtapeCreation';
import styles from './MixtapeEditor.module.css';

interface MixtapeEditorProps {
  allSongs: HistoryItem[];
  onClose: () => void;
}

function getDefaultMixtapeName(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `Mixtape ${year}-${month}-${day}`;
}

function formatTotalDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  if (hours > 0) {
    return `${hours}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

export function MixtapeEditor({ allSongs, onClose }: MixtapeEditorProps) {
  const [mixtapeSongs, setMixtapeSongs] = useState<MixtapeSong[]>([]);
  const [mixtapeName, setMixtapeName] = useState('');
  const { isLoading, error, createMixtape } = useMixtapeCreation({ onSuccess: onClose });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleAddSong = (song: HistoryItem) => {
    const newItem: MixtapeSong = {
      id: crypto.randomUUID(),
      song,
    };
    setMixtapeSongs((prev) => [...prev, newItem]);
  };

  const handleRemoveSong = (itemId: string) => {
    setMixtapeSongs((prev) => prev.filter((item) => item.id !== itemId));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setMixtapeSongs((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        if (oldIndex < 0 || newIndex < 0) return items;
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleCreateMixtape = () => {
    const songIds = mixtapeSongs.map((item) => item.song.id);
    const name = mixtapeName.trim() || getDefaultMixtapeName();
    createMixtape(songIds, name);
  };

  const totalDuration = mixtapeSongs.reduce(
    (sum, item) => sum + (item.song.duration ?? 0),
    0
  );

  const hasSelectedSongs = mixtapeSongs.length > 0;

  return (
    <div className={styles.editor}>
      <div className={styles.columns}>
        <div className={styles.column}>
          <h3 className={styles.columnTitle}>Tilgjengelige sanger</h3>
          <SongPicker songs={allSongs} onAddSong={handleAddSong} />
        </div>
        <div className={styles.column}>
          <h3 className={styles.columnTitle}>Din mixtape</h3>
          <div className={styles.nameInputWrapper}>
            <input
              type="text"
              className={styles.nameInput}
              placeholder={getDefaultMixtapeName()}
              value={mixtapeName}
              onChange={(e) => setMixtapeName(e.target.value)}
              disabled={isLoading}
            />
          </div>
          {mixtapeSongs.length === 0 ? (
            <p className={styles.placeholder}>
              Klikk + for å legge til sanger
            </p>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={mixtapeSongs.map((item) => item.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className={styles.mixtapeList}>
                  {mixtapeSongs.map((item, index) => (
                    <SortableMixtapeItem
                      key={item.id}
                      item={item}
                      index={index}
                      onRemove={() => handleRemoveSong(item.id)}
                      disabled={isLoading}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
          {mixtapeSongs.length > 0 && (
            <div className={styles.mixtapeSummary}>
              {mixtapeSongs.length} {mixtapeSongs.length === 1 ? 'sang' : 'sanger'} &middot; {formatTotalDuration(totalDuration)}
            </div>
          )}
        </div>
      </div>
      {error && <div className={styles.error}>{error}</div>}
      <div className={styles.footer}>
        <button
          type="button"
          className={styles.cancelButton}
          onClick={onClose}
          disabled={isLoading}
        >
          Avbryt
        </button>
        <button
          type="button"
          className={styles.createButton}
          disabled={!hasSelectedSongs || isLoading}
          onClick={handleCreateMixtape}
        >
          {isLoading ? (
            <span className={styles.buttonLoading}>
              <span className={styles.spinner} />
              Lager mixtape...
            </span>
          ) : (
            'Lag Mixtape'
          )}
        </button>
      </div>
    </div>
  );
}

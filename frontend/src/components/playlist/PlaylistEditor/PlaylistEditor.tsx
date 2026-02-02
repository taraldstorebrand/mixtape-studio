import { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
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
import { SongPicker } from '../../mixtape/SongPicker';
import { SortablePlaylistItem, type PlaylistSongEntry } from './SortablePlaylistItem';
import { fetchPlaylist, createPlaylist, updatePlaylist, addSongsToPlaylist, removeSongFromPlaylist, reorderPlaylistSongs } from '../../../services/playlists';
import { t } from '../../../i18n';
import { getErrorMessage } from '../../../utils/errors';
import styles from './PlaylistEditor.module.css';

interface PlaylistEditorProps {
  allSongs: HistoryItem[];
  onClose: () => void;
  onPlaylistChanged: (changedPlaylistId: string) => void;
  playlistId?: string;
}

export function PlaylistEditor({ allSongs, onClose, onPlaylistChanged, playlistId }: PlaylistEditorProps) {
  const [playlistName, setPlaylistName] = useState('');
  const [playlistEntries, setPlaylistEntries] = useState<PlaylistSongEntry[]>([]);
  const [createdPlaylistId, setCreatedPlaylistId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const isEdit = createdPlaylistId !== null || playlistId !== undefined;
  const currentPlaylistId = createdPlaylistId || playlistId || null;

  // Load existing playlist data
  useEffect(() => {
    if (playlistId === undefined) {
      return;
    }

    setIsLoading(true);
    fetchPlaylist(playlistId)
      .then((data) => {
        setPlaylistName(data.name);
        setPlaylistEntries(data.songs);
        setCreatedPlaylistId(null);
        setHasChanges(false);
      })
      .catch((err: unknown) => {
        setError(getErrorMessage(err) || t.errors.couldNotFetchPlaylists);
        console.error(err);
      })
      .finally(() => setIsLoading(false));
  }, [playlistId]);

  const handleAddSong = (song: HistoryItem) => {
    const newEntry: PlaylistSongEntry = {
      entryId: `temp-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
      position: playlistEntries.length,
      song,
    };
    setPlaylistEntries((prev) => [...prev, newEntry]);
    setHasChanges(true);
  };

  const handleRemoveSong = (entryId: string) => {
    setPlaylistEntries((prev) => {
      const filtered = prev.filter((entry) => entry.entryId !== entryId);
      return filtered.map((entry, index) => ({ ...entry, position: index }));
    });
    setHasChanges(true);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = playlistEntries.findIndex((entry) => entry.entryId === active.id);
      const newIndex = playlistEntries.findIndex((entry) => entry.entryId === over.id);

      if (oldIndex < 0 || newIndex < 0) return;

      const reorderedEntries = arrayMove(playlistEntries, oldIndex, newIndex).map((entry, index) => ({ ...entry, position: index }));
      setPlaylistEntries(reorderedEntries);
      setHasChanges(true);
    }
  };

  const handleNameChange = (newName: string) => {
    setPlaylistName(newName);
    setHasChanges(true);
  };

  const handleClose = async () => {
    if (!hasChanges && !playlistName.trim()) {
      onClose();
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let finalPlaylistId = currentPlaylistId;
      const name = playlistName.trim() || 'New Playlist';

      if (!finalPlaylistId) {
        const newPlaylist = await createPlaylist(name);
        finalPlaylistId = newPlaylist.id;
      } else if (name) {
        await updatePlaylist(finalPlaylistId, { name });
      }

      const existingSongIds = new Set<string>();
      if (isEdit && finalPlaylistId) {
        const existingPlaylist = await fetchPlaylist(finalPlaylistId);
        const existingEntries = existingPlaylist.songs;

        const newSongIds = new Set(playlistEntries.map((entry) => entry.song.id));

        const toRemove = existingEntries.filter((entry) => !newSongIds.has(entry.song.id));
        await Promise.all(toRemove.map((entry) => removeSongFromPlaylist(finalPlaylistId, entry.entryId)));

        existingEntries.forEach((entry) => existingSongIds.add(entry.song.id));
      }

      const toAdd = playlistEntries.filter((entry) => !existingSongIds.has(entry.song.id));
      if (toAdd.length > 0) {
        const songIds = toAdd.map((entry) => entry.song.id);
        await addSongsToPlaylist(finalPlaylistId, songIds);
      }

      if (playlistEntries.length > 0) {
        const updatedPlaylist = await fetchPlaylist(finalPlaylistId);
        const newEntriesMap = new Map(playlistEntries.map((entry, index) => [entry.song.id, index]));
        const entryIds = updatedPlaylist.songs
          .filter((entry) => newEntriesMap.has(entry.song.id))
          .sort((a, b) => {
            const aIndex = newEntriesMap.get(a.song.id) ?? 0;
            const bIndex = newEntriesMap.get(b.song.id) ?? 0;
            return aIndex - bIndex;
          })
          .map((entry) => entry.entryId);
        await reorderPlaylistSongs(finalPlaylistId, entryIds);
      }

      onPlaylistChanged(finalPlaylistId);
      onClose();
    } catch (err: unknown) {
      setError(getErrorMessage(err) || t.errors.couldNotUpdatePlaylist);
      console.error(err);
      setIsLoading(false);
    }
  };

  // Clear error after delay
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  if (isLoading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  return (
    <div className={styles.editor}>
      <div className={styles.columns}>
        <div className={styles.column}>
          <h3 className={styles.columnTitle}>{t.headings.availableSongs}</h3>
          <SongPicker songs={allSongs} onAddSong={handleAddSong} />
        </div>
        <div className={styles.column}>
          <div className={styles.playlistHeader}>
            <h3 className={styles.columnTitle}>
              {isEdit ? t.headings.editPlaylist : t.headings.newPlaylist}
            </h3>
            <input
              type="text"
              className={styles.nameInput}
              placeholder={t.placeholders.playlistName}
              value={playlistName}
              onChange={(e) => handleNameChange(e.target.value)}
            />
          </div>
          {!isEdit && playlistEntries.length === 0 ? (
            <p className={styles.placeholder}>
              {t.messages.createPlaylistFirst}
            </p>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={playlistEntries.map((entry) => entry.entryId)}
                strategy={verticalListSortingStrategy}
              >
                <div className={styles.playlistList}>
                  {playlistEntries.map((entry, index) => (
                    <SortablePlaylistItem
                      key={entry.entryId}
                      entry={entry}
                      index={index}
                      onRemove={handleRemoveSong}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
          {playlistEntries.length > 0 && (
            <div className={styles.playlistSummary}>
              {t.messages.songCount(playlistEntries.length)}
            </div>
          )}
        </div>
      </div>
      {error && <div className={styles.error}>{error}</div>}
      <div className={styles.footer}>
        <button
          type="button"
          className={styles.closeButton}
          onClick={handleClose}
          disabled={isLoading}
        >
          {isLoading ? t.actions.creatingMixtape : t.actions.close}
        </button>
      </div>
    </div>
  );
}

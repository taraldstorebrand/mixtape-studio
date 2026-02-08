import { useState, useEffect, useRef } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
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
import { SongPicker } from '../../mixtape/SongPicker/SongPicker';
import { SortablePlaylistItem, type PlaylistSongEntry } from './SortablePlaylistItem';
import { fetchPlaylist, createPlaylist, updatePlaylist, addSongsToPlaylist, removeSongFromPlaylist, reorderPlaylistSongs } from '../../../services/playlists';
import { t } from '../../../i18n';
import { getErrorMessage } from '../../../utils/errors';
import { formatDuration } from '../../../utils/formatDuration';
import { audioSourceAtom, playbackQueueAtom, currentQueueIndexAtom, selectedQueueEntryIdAtom } from '../../../store/atoms';
import styles from './PlaylistEditor.module.css';

interface PlaylistEditorProps {
  allSongs: HistoryItem[];
  onClose: () => void;
  onPlaylistChanged: (changedPlaylistId: string) => void;
  playlistId?: string;
}

interface Snapshot {
  name: string;
  entryIds: string[];
}

function getPlaylistDurationText(playlistEntries: PlaylistSongEntry[]): string {
  const totalSeconds = playlistEntries.reduce((sum, e) => sum + (e.song.duration ?? 0), 0);
  const formatted = formatDuration(totalSeconds);
  return formatted ? ` · ${formatted}` : '';
}

export function PlaylistEditor({ allSongs, onClose, onPlaylistChanged, playlistId }: PlaylistEditorProps) {
  const [playlistName, setPlaylistName] = useState('');
  const [playlistEntries, setPlaylistEntries] = useState<PlaylistSongEntry[]>([]);
  const [createdPlaylistId, setCreatedPlaylistId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const snapshotRef = useRef<Snapshot | null>(null);

  const audioSource = useAtomValue(audioSourceAtom);
  const setPlaybackQueue = useSetAtom(playbackQueueAtom);
  const setCurrentQueueIndex = useSetAtom(currentQueueIndexAtom);
  const selectedQueueEntryId = useAtomValue(selectedQueueEntryIdAtom);

  // Sync playback queue when editor entries change (if currently playing from editor)
  useEffect(() => {
    if (!audioSource) return;
    const isPlayingFromEditor = playlistEntries.some((e) => e.song.id === audioSource.id);
    if (isPlayingFromEditor) {
      const newQueue = playlistEntries.map((e) => ({ entryId: e.entryId, songId: e.song.id }));
      setPlaybackQueue(newQueue);

      if (selectedQueueEntryId) {
        const newIndex = newQueue.findIndex((e) => e.entryId === selectedQueueEntryId);
        if (newIndex >= 0) {
          setCurrentQueueIndex(newIndex);
        }
      }
    }
  }, [playlistEntries, audioSource, setPlaybackQueue, selectedQueueEntryId, setCurrentQueueIndex]);

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

  const computeHasChanges = (): boolean => {
    if (!snapshotRef.current) {
      return playlistName.trim() !== '' || playlistEntries.length > 0;
    }

    const snapshot = snapshotRef.current;
    if (playlistName !== snapshot.name) return true;

    const currentEntryIds = playlistEntries.map((e) => e.entryId);
    if (currentEntryIds.length !== snapshot.entryIds.length) return true;

    const hasTempEntries = playlistEntries.some((e) => e.entryId.startsWith('temp-'));
    if (hasTempEntries) return true;

    for (let i = 0; i < currentEntryIds.length; i++) {
      if (currentEntryIds[i] !== snapshot.entryIds[i]) return true;
    }

    return false;
  };

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
        snapshotRef.current = {
          name: data.name,
          entryIds: data.songs.map((s) => s.entryId),
        };
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
  };

  const handleRemoveSong = (entryId: string) => {
    setPlaylistEntries((prev) => {
      const filtered = prev.filter((entry) => entry.entryId !== entryId);
      return filtered.map((entry, index) => ({ ...entry, position: index }));
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = playlistEntries.findIndex((entry) => entry.entryId === active.id);
      const newIndex = playlistEntries.findIndex((entry) => entry.entryId === over.id);

      if (oldIndex < 0 || newIndex < 0) return;

      const reorderedEntries = arrayMove(playlistEntries, oldIndex, newIndex).map((entry, index) => ({ ...entry, position: index }));
      setPlaylistEntries(reorderedEntries);
    }
  };

  const handleNameChange = (newName: string) => {
    setPlaylistName(newName);
  };

  const handleSave = async () => {
    const hasChanges = computeHasChanges();

    if (!hasChanges) {
      onClose();
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      let finalPlaylistId = currentPlaylistId;
      const name = playlistName.trim() || 'New Playlist';

      // Step 1: Create or update playlist
      if (!finalPlaylistId) {
        const result = await createPlaylist(name);
        finalPlaylistId = result.id;
        setCreatedPlaylistId(finalPlaylistId);
      } else {
        const snapshot = snapshotRef.current;
        if (!snapshot || name !== snapshot.name) {
          await updatePlaylist(finalPlaylistId, { name });
        }
      }

      // Step 2: Compute diff using snapshot (no extra fetch needed)
      const existingEntries = playlistEntries.filter((e) => !e.entryId.startsWith('temp-'));
      const tempEntries = playlistEntries.filter((e) => e.entryId.startsWith('temp-'));

      const initialEntryIds = snapshotRef.current?.entryIds ?? [];
      const currentExistingIds = new Set(existingEntries.map((e) => e.entryId));
      const toRemove = initialEntryIds.filter((id) => !currentExistingIds.has(id));

      // Step 3: Remove deleted entries
      if (toRemove.length > 0) {
        await Promise.all(toRemove.map((entryId) => removeSongFromPlaylist(finalPlaylistId, entryId)));
      }

      // Step 4: Add new entries and get their entryIds
      let newEntryIds: string[] = [];
      if (tempEntries.length > 0) {
        const songIds = tempEntries.map((entry) => entry.song.id);
        const result = await addSongsToPlaylist(finalPlaylistId, songIds);
        newEntryIds = result.entryIds;
      }

      // Step 5: Build final order and reorder
      if (playlistEntries.length > 0) {
        let tempIndex = 0;
        const finalEntryIds = playlistEntries.map((entry) => {
          if (entry.entryId.startsWith('temp-')) {
            return newEntryIds[tempIndex++];
          }
          return entry.entryId;
        }).filter((id): id is string => id !== undefined);

        if (finalEntryIds.length !== playlistEntries.length) {
          throw new Error('Entry ID count mismatch - some songs may not have been saved correctly');
        }

        await reorderPlaylistSongs(finalPlaylistId, finalEntryIds);
      }

      onPlaylistChanged(finalPlaylistId);
      onClose();
    } catch (err: unknown) {
      setError(getErrorMessage(err) || t.errors.couldNotUpdatePlaylist);
      console.error(err);
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  // Clear error after delay
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  if (isLoading) {
    return (
      <div className={styles.loading} role="status" aria-busy="true">
        Loading...
      </div>
    );
  }

  const hasChanges = computeHasChanges();

  return (
    <div className={styles.editor} aria-busy={isSaving}>
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
            <label htmlFor="playlistNameInput" className={styles.visuallyHidden}>
              {t.placeholders.playlistName}
            </label>
            <input
              id="playlistNameInput"
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
                      allEntries={playlistEntries}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
          {playlistEntries.length > 0 && (
            <div className={styles.playlistSummary}>
              {playlistEntries.length} {t.messages.songCount(playlistEntries.length)}
              {getPlaylistDurationText(playlistEntries)}
            </div>
          )}
        </div>
      </div>
      {error && (
        <div className={styles.error} role="alert">
          {error}
        </div>
      )}
      <div className={styles.footer}>
        <button
          type="button"
          className={styles.cancelButton}
          onClick={handleCancel}
          disabled={isSaving}
        >
          {t.actions.cancel}
        </button>
        <button
          type="button"
          className={styles.saveButton}
          onClick={handleSave}
          disabled={isSaving || !hasChanges}
        >
          {isSaving ? t.actions.saving : t.actions.save}
        </button>
      </div>
    </div>
  );
}

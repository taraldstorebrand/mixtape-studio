import { useEffect, useState } from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { HistoryItem as HistoryItemType } from '../../types';
import { HistoryItem } from './HistoryItem/HistoryItem';
import { MixtapeButton } from './MixtapeButton/MixtapeButton';
import { UploadButton } from './UploadButton/UploadButton';
import { PlaylistDropdown } from './PlaylistDropdown/PlaylistDropdown';
import { PlaylistActions } from './PlaylistActions/PlaylistActions';
import { currentPlaylistSongsAtom, filterAtom, filteredHistoryAtom, playlistsAtom, selectedPlaylistIdAtom } from '../../store';
import { t } from '../../i18n';
import { fetchPlaylists, fetchPlaylist, deletePlaylist } from '../../services/playlists';
import { Modal } from '../common/Modal/Modal';
import { PlaylistEditor } from '../playlist/PlaylistEditor/PlaylistEditor';
import styles from './HistoryList.module.css';

interface HistoryListProps {
    items: HistoryItemType[];
    selectedItemId: string | null;
    onFeedback: (id: string, feedback: 'up' | 'down' | null) => void;
    onSelect: (item: HistoryItemType) => void;
    onDeleteItem: (id: string) => void;
}

export function HistoryList({ items, selectedItemId, onFeedback, onSelect, onDeleteItem }: HistoryListProps) {
    const [filter, setFilter] = useAtom(filterAtom);
    const [isUploadFormActive, setIsUploadFormActive] = useState(false);
    const [isPlaylistEditorOpen, setIsPlaylistEditorOpen] = useState(false);
    const [editingPlaylistId, setEditingPlaylistId] = useState<string | undefined>(undefined);
    const playlists = useAtomValue(playlistsAtom);
    const selectedPlaylistId = useAtomValue(selectedPlaylistIdAtom);
    const setPlaylists = useSetAtom(playlistsAtom);
    const setSelectedPlaylistId = useSetAtom(selectedPlaylistIdAtom);
    const setCurrentPlaylistSongs = useSetAtom(currentPlaylistSongsAtom);
    const currentPlaylistSongs = useAtomValue(currentPlaylistSongsAtom);
    const filteredItems = useAtomValue(filteredHistoryAtom);

    const completedSongs = (songs: HistoryItemType[]) => songs.filter(song => song.sunoLocalUrl || (song.sunoStatus === 'completed' && song.sunoAudioUrl));
    const likedItems = completedSongs(items.filter(item => item.feedback === 'up'));

    const displayItems = currentPlaylistSongs !== null ? currentPlaylistSongs : filteredItems;

    const selectedPlaylist = playlists.find((p) => p.id === selectedPlaylistId);

    const handleCreatePlaylist = () => {
        setEditingPlaylistId(undefined);
        setIsPlaylistEditorOpen(true);
    };

    const handleEditPlaylist = (playlistId: string) => {
        setEditingPlaylistId(playlistId);
        setIsPlaylistEditorOpen(true);
    };

    const handleDeletePlaylist = async (playlistId: string) => {
        try {
            await deletePlaylist(playlistId);
            await fetchPlaylists().then(setPlaylists);
            if (selectedPlaylistId === playlistId) {
                setSelectedPlaylistId(null);
                setCurrentPlaylistSongs(null);
            }
        } catch (error) {
            console.error('Failed to delete playlist:', error);
        }
    };

    const handleReturnToLibrary = () => {
        setSelectedPlaylistId(null);
        setCurrentPlaylistSongs(null);
    };

    const handleFeedback = async (id: string, feedback: 'up' | 'down' | null) => {
        await onFeedback(id, feedback);

        if (selectedPlaylistId !== null && currentPlaylistSongs) {
            const updatedSongs = currentPlaylistSongs.map((item) =>
                item.id === id ? { ...item, feedback: feedback ?? undefined } : item
            );
            setCurrentPlaylistSongs(updatedSongs);
        }
    };

    const handlePlaylistChanged = async (changedPlaylistId: string) => {
        const updated = await fetchPlaylists();
        setPlaylists(updated);

        if (selectedPlaylistId === changedPlaylistId) {
            const updatedPlaylist = await fetchPlaylist(changedPlaylistId);
            const songs = updatedPlaylist.songs.map((entry) => entry.song);
            setCurrentPlaylistSongs(songs);
        }
    };

    const handleClosePlaylistEditor = () => {
        setIsPlaylistEditorOpen(false);
        setEditingPlaylistId(undefined);
    };

    // Fetch playlists on mount
    useEffect(() => {
        fetchPlaylists().then(setPlaylists).catch(console.error);
    }, [setPlaylists]);

    // Fetch playlist songs when selectedPlaylistId changes
    useEffect(() => {
        if (selectedPlaylistId === null) {
            setCurrentPlaylistSongs(null);
            return;
        }

        fetchPlaylist(selectedPlaylistId)
            .then((playlistWithSongs) => {
                const songs = playlistWithSongs.songs.map((entry) => entry.song);
                setCurrentPlaylistSongs(songs);
            })
            .catch(console.error);
    }, [selectedPlaylistId, setCurrentPlaylistSongs]);

    return (
        <div className={styles.historyList}>
            <div className={styles.panelActions}>
                <div className={styles.panelActionsButtons}>
                    <UploadButton onUploadFormChange={setIsUploadFormActive} />
                    {!isUploadFormActive && (
                        <MixtapeButton likedItems={selectedPlaylistId !== null ? completedSongs(currentPlaylistSongs ?? []) : likedItems} playlistId={selectedPlaylistId ?? undefined} />
                    )}
                </div>
                {!isUploadFormActive && (
                    <div className={styles.headerBar}>
                        <PlaylistDropdown playlists={playlists} selectedPlaylistId={selectedPlaylistId} />
                        <PlaylistActions
                            onCreatePlaylist={handleCreatePlaylist}
                            onEditPlaylist={handleEditPlaylist}
                            onDeletePlaylist={handleDeletePlaylist}
                            onReturnToLibrary={handleReturnToLibrary}
                        />
                        {selectedPlaylistId === null && (
                            <>
                                <h2>{t.filters.songs} ({filteredItems.length})</h2>
                                <div className={styles.filterButtons}>
                                    <button
                                        type="button"
                                        className={`${styles.filterButton} ${filter === 'default' ? styles.active : ''}`}
                                        onClick={() => setFilter('default')}
                                    >
                                        {t.filters.songs}
                                    </button>
                                    <button
                                        type="button"
                                        className={`${styles.filterButton} ${filter === 'liked' ? styles.active : ''}`}
                                        onClick={() => setFilter('liked')}
                                    >
                                        {t.filters.liked}
                                    </button>
                                    <button
                                        type="button"
                                        className={`${styles.filterButton} ${filter === 'all' ? styles.active : ''}`}
                                        onClick={() => setFilter('all')}
                                    >
                                        {t.filters.all}
                                    </button>
                                </div>
                            </>
                        )}
                        {selectedPlaylistId !== null && selectedPlaylist && (
                            <h2>{selectedPlaylist.name} ({displayItems.length})</h2>
                        )}
                    </div>
                )}
            </div>
            {displayItems.length === 0 ? (
                <div className={styles.empty}>
                    <p>{selectedPlaylistId !== null ? t.messages.noSongsInPlaylist : t.messages.noSongsAvailable}</p>
                </div>
            ) : (
                <>
                    {displayItems.map((item) => (
                        <HistoryItem
                            key={item.id}
                            item={item}
                            isSelected={item.id === selectedItemId}
                            onFeedback={handleFeedback}
                            onSelect={onSelect}
                            onDelete={() => onDeleteItem(item.id)}
                        />
                    ))}
                </>
            )}
            {isPlaylistEditorOpen && (
                <Modal
                    isOpen={isPlaylistEditorOpen}
                    onClose={handleClosePlaylistEditor}
                    title={editingPlaylistId ? t.headings.editPlaylist : t.headings.newPlaylist}
                >
                        <PlaylistEditor
                        allSongs={items}
                        onClose={handleClosePlaylistEditor}
                        onPlaylistChanged={handlePlaylistChanged}
                        playlistId={editingPlaylistId}
                    />
                </Modal>
            )}
        </div>
    );
}

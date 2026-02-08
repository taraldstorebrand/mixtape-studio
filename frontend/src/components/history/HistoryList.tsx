import { useEffect, useState, useRef } from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { HistoryItem as HistoryItemType } from '../../types';
import { HistoryItem } from './HistoryItem/HistoryItem';
import { MixtapeButton } from './MixtapeButton/MixtapeButton';
import { UploadButton } from './UploadButton/UploadButton';
import { PlaylistDropdown } from './PlaylistDropdown/PlaylistDropdown';
import { PlaylistActions } from './PlaylistActions/PlaylistActions';
import { currentPlaylistEntriesAtom, currentPlaylistSongsAtom, filterAtom, filteredHistoryAtom, playlistsAtom, selectedPlaylistIdAtom, scrollToItemIdAtom } from '../../store';
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
    const [highlightedItemId, setHighlightedItemId] = useState<string | null>(null);
    const playlists = useAtomValue(playlistsAtom);
    const selectedPlaylistId = useAtomValue(selectedPlaylistIdAtom);
    const setPlaylists = useSetAtom(playlistsAtom);
    const setSelectedPlaylistId = useSetAtom(selectedPlaylistIdAtom);
    const setCurrentPlaylistSongs = useSetAtom(currentPlaylistSongsAtom);
    const setCurrentPlaylistEntries = useSetAtom(currentPlaylistEntriesAtom);
    const currentPlaylistSongs = useAtomValue(currentPlaylistSongsAtom);
    const currentPlaylistEntries = useAtomValue(currentPlaylistEntriesAtom);
    const filteredItems = useAtomValue(filteredHistoryAtom);
    const scrollToItemId = useAtomValue(scrollToItemIdAtom);
    const itemRefs = useRef<Map<string, HTMLElement>>(new Map());

    const completedSongs = (songs: HistoryItemType[]) => songs.filter(song => song.sunoLocalUrl || (song.sunoStatus === 'completed' && song.sunoAudioUrl));
    const likedItems = completedSongs(items.filter(item => item.feedback === 'up'));

    const displayItems = currentPlaylistSongs !== null ? currentPlaylistSongs : filteredItems;

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
                setCurrentPlaylistEntries(null);
            }
        } catch (error) {
            console.error('Failed to delete playlist:', error);
        }
    };

    const handleReturnToLibrary = () => {
        setSelectedPlaylistId(null);
        setCurrentPlaylistSongs(null);
        setCurrentPlaylistEntries(null);
    };

    const handleFeedback = async (id: string, feedback: 'up' | 'down' | null) => {
        await onFeedback(id, feedback);

        if (selectedPlaylistId !== null && currentPlaylistSongs) {
            const updatedSongs = currentPlaylistSongs.map((item) =>
                item.id === id ? { ...item, feedback: feedback ?? undefined } : item
            );
            setCurrentPlaylistSongs(updatedSongs);
        }
        if (selectedPlaylistId !== null && currentPlaylistEntries) {
            const updatedEntries = currentPlaylistEntries.map((entry) =>
                entry.song.id === id ? { ...entry, song: { ...entry.song, feedback: feedback ?? undefined } } : entry
            );
            setCurrentPlaylistEntries(updatedEntries);
        }
    };

    const handlePlaylistChanged = async (changedPlaylistId: string) => {
        const updated = await fetchPlaylists();
        setPlaylists(updated);

        if (selectedPlaylistId === changedPlaylistId) {
            const updatedPlaylist = await fetchPlaylist(changedPlaylistId);
            const songs = updatedPlaylist.songs.map((entry) => entry.song);
            setCurrentPlaylistSongs(songs);
            setCurrentPlaylistEntries(updatedPlaylist.songs);
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
            setCurrentPlaylistEntries(null);
            return;
        }

        fetchPlaylist(selectedPlaylistId)
            .then((playlistWithSongs) => {
                const songs = playlistWithSongs.songs.map((entry) => entry.song);
                setCurrentPlaylistSongs(songs);
                setCurrentPlaylistEntries(playlistWithSongs.songs);
            })
            .catch(console.error);
    }, [selectedPlaylistId, setCurrentPlaylistSongs, setCurrentPlaylistEntries]);

    useEffect(() => {
        if (scrollToItemId === null) return;

        let highlightTimeoutId: ReturnType<typeof setTimeout>;

        const scrollTimeoutId = setTimeout(() => {
            const targetElement = itemRefs.current.get(scrollToItemId);

            if (!targetElement) {
                return;
            }

            const isElementVisible = () => {
                const rect = targetElement.getBoundingClientRect();
                const windowHeight = window.innerHeight || document.documentElement.clientHeight;
                return (
                    rect.top >= 0 &&
                    rect.left >= 0 &&
                    rect.bottom <= windowHeight &&
                    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
                );
            };

            if (!isElementVisible()) {
                targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }

            setHighlightedItemId(scrollToItemId);

            highlightTimeoutId = setTimeout(() => {
                setHighlightedItemId(null);
            }, 1500);
        }, 100);

        return () => {
            clearTimeout(scrollTimeoutId);
            clearTimeout(highlightTimeoutId);
        };
    }, [scrollToItemId]);

    const setItemRef = (itemId: string, element: HTMLElement | null) => {
        if (element) {
            itemRefs.current.set(itemId, element);
        } else {
            itemRefs.current.delete(itemId);
        }
    };

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
                        <div className={styles.headerBarLeft}>
                            {selectedPlaylistId !== null && (
                                <button
                                    type="button"
                                    className={styles.backButton}
                                    onClick={handleReturnToLibrary}
                                    title={t.tooltips.returnToLibrary}
                                    aria-label={t.tooltips.returnToLibrary}
                                >
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
                                        <path d="M3 8H13M3 8L6 5M3 8L6 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                    {t.filters.library}
                                </button>
                            )}
                            <PlaylistDropdown playlists={playlists} selectedPlaylistId={selectedPlaylistId} itemCount={displayItems.length} onCreatePlaylist={selectedPlaylistId ? handleCreatePlaylist : undefined} />
                            {selectedPlaylistId === null && (
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
                            )}
                        </div>
                        <div className={styles.headerBarRight}>
                            <PlaylistActions
                                onCreatePlaylist={handleCreatePlaylist}
                                onEditPlaylist={handleEditPlaylist}
                                onDeletePlaylist={handleDeletePlaylist}
                            />
                        </div>
                    </div>
                )}
            </div>
            {displayItems.length === 0 ? (
                <div className={styles.empty}>
                    <p>{selectedPlaylistId !== null ? t.messages.noSongsInPlaylist : t.messages.noSongsAvailable}</p>
                </div>
            ) : (
                <>
                    {displayItems.map((item, index) => {
                        const entryId = currentPlaylistEntries?.[index]?.entryId ?? null;
                        return (
                            <HistoryItem
                                key={entryId ?? `${item.id}-${index}`}
                                item={item}
                                entryId={entryId}
                                isSelected={item.id === selectedItemId}
                                highlight={item.id === highlightedItemId}
                                onFeedback={handleFeedback}
                                onSelect={onSelect}
                                onDelete={() => onDeleteItem(item.id)}
                                itemRef={(element) => setItemRef(item.id, element)}
                            />
                        );
                    })}
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

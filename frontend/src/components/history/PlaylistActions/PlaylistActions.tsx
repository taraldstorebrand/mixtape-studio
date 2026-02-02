import { useAtomValue } from 'jotai';
import { selectedPlaylistIdAtom, playlistsAtom } from '../../../store';
import type { Playlist } from '../../../types';
import { t } from '../../../i18n';
import styles from './PlaylistActions.module.css';

interface PlaylistActionsProps {
  onCreatePlaylist: () => void;
  onEditPlaylist: (playlistId: string) => void;
  onDeletePlaylist: (playlistId: string) => void;
  onReturnToLibrary: () => void;
}

export function PlaylistActions({ onCreatePlaylist, onEditPlaylist, onDeletePlaylist, onReturnToLibrary }: PlaylistActionsProps) {
  const selectedPlaylistId = useAtomValue(selectedPlaylistIdAtom);
  const playlists = useAtomValue(playlistsAtom);
  const selectedPlaylist: Playlist | undefined = playlists.find((p) => p.id === selectedPlaylistId);
  const isInPlaylistMode = selectedPlaylistId !== null;

  const handleDelete = () => {
    if (!selectedPlaylistId) return;
    if (confirm(`Delete playlist "${selectedPlaylist?.name}"?`)) {
      onDeletePlaylist(selectedPlaylistId);
    }
  };

  const handleReturnToLibrary = () => {
    onReturnToLibrary();
  };

  return (
    <div className={styles.playlistActions}>
      {isInPlaylistMode ? (
        <>
          <button
            type="button"
            className={styles.actionButton}
            onClick={onCreatePlaylist}
            title={t.tooltips.createPlaylist}
            aria-label={t.tooltips.createPlaylist}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
              <path d="M8 2V14M2 8H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
          <button
            type="button"
            className={styles.actionButton}
            onClick={() => selectedPlaylistId && onEditPlaylist(selectedPlaylistId)}
            title={t.tooltips.editPlaylist}
            aria-label={t.tooltips.editPlaylist}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
              <path d="M2.5 11.5L4.5 13.5L13.5 4.5M4.5 13.5L8 10M4.5 13.5L2.5 15.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M11 2H14V5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button
            type="button"
            className={`${styles.actionButton} ${styles.deleteButton}`}
            onClick={handleDelete}
            title={t.tooltips.deletePlaylist}
            aria-label={t.tooltips.deletePlaylist}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
              <path d="M2 4H14M4 4V13.5C4 14.0523 4.44772 14.5 5 14.5H11C11.5523 14.5 12 14.0523 12 13.5V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
          <button
            type="button"
            className={styles.actionButton}
            onClick={handleReturnToLibrary}
            title={t.tooltips.returnToLibrary}
            aria-label={t.tooltips.returnToLibrary}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
              <path d="M3 8H13M3 8L6 5M3 8L6 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </>
      ) : (
        <button
          type="button"
          className={styles.createButton}
          onClick={onCreatePlaylist}
          title={t.tooltips.createPlaylist}
          aria-label={t.tooltips.createPlaylist}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
            <path d="M8 2V14M2 8H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span>{t.actions.createPlaylist}</span>
        </button>
      )}
    </div>
  );
}

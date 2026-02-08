import { useState, useRef, useEffect } from 'react';
import { useSetAtom } from 'jotai';
import type { Playlist } from '../../../types';
import { selectedPlaylistIdAtom } from '../../../store';
import { t } from '../../../i18n';
import styles from './PlaylistDropdown.module.css';

interface PlaylistDropdownProps {
  playlists: Playlist[];
  selectedPlaylistId: string | null;
  itemCount: number;
  onCreatePlaylist?: () => void;
}

export function PlaylistDropdown({ playlists, selectedPlaylistId, itemCount, onCreatePlaylist }: PlaylistDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const setSelectedPlaylistId = useSetAtom(selectedPlaylistIdAtom);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedPlaylist = playlists.find((p) => p.id === selectedPlaylistId);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelectLibrary = () => {
    setSelectedPlaylistId(null);
    setIsOpen(false);
  };

  const handleSelectPlaylist = (playlistId: string) => {
    setSelectedPlaylistId(playlistId);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      return;
    }
  };

  return (
    <div className={styles.dropdown} ref={dropdownRef} onKeyDown={handleKeyDown}>
      <button
        type="button"
        className={styles.dropdownButton}
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <span className={styles.selectedText}>
          {selectedPlaylist ? selectedPlaylist.name : t.filters.songs} ({itemCount})
        </span>
        <svg
          className={`${styles.chevron} ${isOpen ? styles.open : ''}`}
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {isOpen && (
        <div className={styles.menu} role="menu">
          {playlists.length === 0 ? (
            <div className={styles.emptyState}>
              <p>{t.messages.noSongsAvailable}</p>
              {onCreatePlaylist && (
                <button
                  type="button"
                  className={styles.createButton}
                  onClick={() => {
                    setIsOpen(false);
                    onCreatePlaylist();
                  }}
                >
                  {t.actions.createPlaylist}
                </button>
              )}
            </div>
          ) : (
            <>
              {playlists.map((playlist) => (
                <button
                  key={playlist.id}
                  type="button"
                  className={`${styles.menuItem} ${playlist.id === selectedPlaylistId ? styles.selected : ''}`}
                  onClick={() => handleSelectPlaylist(playlist.id)}
                  role="menuitem"
                  aria-selected={playlist.id === selectedPlaylistId}
                  title={playlist.name}
                >
                  {playlist.name}
                </button>
              ))}
              {onCreatePlaylist && (
                <>
                  <div className={styles.menuSeparator} />
                  <button
                    type="button"
                    className={`${styles.menuItem} ${styles.createMenuItem}`}
                    onClick={() => {
                      setIsOpen(false);
                      onCreatePlaylist();
                    }}
                    role="menuitem"
                  >
                    + {t.actions.createPlaylist}
                  </button>
                </>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

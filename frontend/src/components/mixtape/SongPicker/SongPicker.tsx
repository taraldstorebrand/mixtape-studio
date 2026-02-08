import { useState } from 'react';
import type { HistoryItem } from '../../../types';
import { SongPickerItem } from './SongPickerItem/SongPickerItem';
import styles from './SongPicker.module.css';
import { t } from '../../../i18n';

interface SongPickerProps {
  songs: HistoryItem[];
  onAddSong: (song: HistoryItem) => void;
}

type FilterType = 'default' | 'liked' | 'all';

export function SongPicker({ songs, onAddSong }: SongPickerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('default');

  const completedSongs = songs.filter(
    (song) => song.sunoLocalUrl || (song.sunoStatus === 'completed' && song.sunoAudioUrl)
  );

  let filteredSongs = completedSongs;

  if (filter === 'liked') {
    filteredSongs = filteredSongs.filter((song) => song.feedback === 'up');
  } else if (filter === 'default') {
    filteredSongs = filteredSongs.filter((song) => song.feedback !== 'down');
  }

  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    filteredSongs = filteredSongs.filter((song) => {
      const title = song.title?.toLowerCase() || '';
      const prompt = song.prompt?.toLowerCase() || '';
      return title.includes(query) || prompt.includes(query);
    });
  }

  return (
    <div className={styles.songPicker}>
      <div className={styles.controls}>
        <div className={styles.searchWrapper}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder={t.placeholders.searchForSongs}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className={styles.clearButton}
              onClick={() => setSearchQuery('')}
              aria-label={t.tooltips.clear}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" focusable="false">
                <path d="M11 3L3 11M3 3L11 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          )}
        </div>
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
      </div>
      <div className={styles.songList}>
        {filteredSongs.length === 0 ? (
          <p className={styles.emptyMessage}>
            {searchQuery ? t.messages.noSongsFound : t.messages.noSongsAvailable}
          </p>
        ) : (
          filteredSongs.map((song) => (
            <SongPickerItem key={song.id} song={song} onAdd={() => onAddSong(song)} />
          ))
        )}
      </div>
    </div>
  );
}

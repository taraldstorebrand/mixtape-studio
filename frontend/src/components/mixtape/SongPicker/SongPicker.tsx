import { useState } from 'react';
import type { HistoryItem } from '../../../types';
import { SongPickerItem } from './SongPickerItem';
import styles from './SongPicker.module.css';

interface SongPickerProps {
  songs: HistoryItem[];
  onAddSong: (song: HistoryItem) => void;
}

type FilterType = 'default' | 'liked' | 'all';

export function SongPicker({ songs, onAddSong }: SongPickerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('default');

  const completedSongs = songs.filter(
    (song) => song.sunoStatus === 'completed' && song.sunoLocalUrl
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
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Søk etter sanger..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className={styles.filterButtons}>
          <button
            type="button"
            className={`${styles.filterButton} ${filter === 'default' ? styles.active : ''}`}
            onClick={() => setFilter('default')}
          >
            Sanger
          </button>
          <button
            type="button"
            className={`${styles.filterButton} ${filter === 'liked' ? styles.active : ''}`}
            onClick={() => setFilter('liked')}
          >
            Likte
          </button>
          <button
            type="button"
            className={`${styles.filterButton} ${filter === 'all' ? styles.active : ''}`}
            onClick={() => setFilter('all')}
          >
            Alle
          </button>
        </div>
      </div>
      <div className={styles.songList}>
        {filteredSongs.length === 0 ? (
          <p className={styles.emptyMessage}>
            {searchQuery ? 'Ingen sanger funnet' : 'Ingen sanger tilgjengelig'}
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

import { t } from '../../i18n';
import { GenreInput } from './LyricsTextarea/GenreInput/GenreInput';
import styles from './LyricsTextarea.module.css';

interface LyricsTextareaProps {
  lyrics: string;
  onChange: (lyrics: string) => void;
  title: string;
  onTitleChange: (title: string) => void;
  genre: string;
  onGenreChange: (genre: string) => void;
  isLoading: boolean;
  genreHistory: string[];
  onRemoveGenre: (genre: string) => void;
}

export function LyricsTextarea({
  lyrics,
  onChange,
  title,
  onTitleChange,
  genre,
  onGenreChange,
  isLoading,
  genreHistory,
  onRemoveGenre,
}: LyricsTextareaProps) {
  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.titleInputContainer}>
          <label className={styles.titleLabel}>{t.labels.songTitle}</label>
          <div className={styles.skeleton} style={{ height: '2.5rem', width: '100%' }} />
        </div>
        <label className={styles.label}>{t.labels.lyrics}</label>
        <div className={styles.skeletonLyrics}>
          <div className={styles.skeletonLine} />
          <div className={styles.skeletonLine} />
          <div className={styles.skeletonLine} />
          <div className={styles.skeletonLine} />
          <div className={styles.skeletonLine} />
          <div className={styles.skeletonLine} />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.titleInputContainer}>
        <label htmlFor="title-input" className={styles.titleLabel}>
          {t.labels.songTitle}
        </label>
        <input
          id="title-input"
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          className={styles.titleInput}
          placeholder={t.placeholders.enterSongTitle}
        />
      </div>
      <label htmlFor="lyrics-editor" className={styles.label}>
        {t.labels.lyrics}
      </label>
      <textarea
        id="lyrics-editor"
        value={lyrics}
        onChange={(e) => onChange(e.target.value)}
        className={styles.editor}
        rows={14}
        placeholder={t.placeholders.writeLyricsHere}
      />
      <div className={styles.genreInputContainer}>
        <label className={styles.genreLabel}>
          {t.labels.genreStyle}
        </label>
        <GenreInput
          value={genre}
          onChange={onGenreChange}
          genreHistory={genreHistory}
          onRemoveGenre={onRemoveGenre}
        />
      </div>
    </div>
  );
}

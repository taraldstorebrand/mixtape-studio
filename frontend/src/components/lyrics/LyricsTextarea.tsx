import { GenreInput } from '../GenreInput';

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
      <div className="lyrics-container">
        <div className="title-input-container">
          <label className="title-label">Sangtittel (påkrevd):</label>
          <div className="skeleton" style={{ height: '2.5rem', width: '100%' }} />
        </div>
        <label className="lyrics-label">Sangtekst:</label>
        <div className="skeleton-lyrics">
          <div className="skeleton-line" />
          <div className="skeleton-line" />
          <div className="skeleton-line" />
          <div className="skeleton-line" />
          <div className="skeleton-line" />
          <div className="skeleton-line" />
        </div>
      </div>
    );
  }

  return (
    <div className="lyrics-container">
      <div className="title-input-container">
        <label htmlFor="title-input" className="title-label">
          Sangtittel (påkrevd):
        </label>
        <input
          id="title-input"
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          className="title-input"
          placeholder="Skriv inn sangtittel..."
        />
      </div>
      <label htmlFor="lyrics-editor" className="lyrics-label">
        Sangtekst:
      </label>
      <textarea
        id="lyrics-editor"
        value={lyrics}
        onChange={(e) => onChange(e.target.value)}
        className="lyrics-editor"
        rows={14}
        placeholder="Skriv sangteksten her..."
      />
      <div className="genre-input-container">
        <label className="genre-label">
          Sjanger/stil (valgfritt):
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

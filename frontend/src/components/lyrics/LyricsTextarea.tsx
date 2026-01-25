import { GenreInput } from '../GenreInput';

interface LyricsTextareaProps {
  lyrics: string;
  onChange: (lyrics: string) => void;
  title: string;
  onTitleChange: (title: string) => void;
  genre: string;
  onGenreChange: (genre: string) => void;
  onGenerateSong: () => void;
  isLoading: boolean;
  isGeneratingSong: boolean;
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
  onGenerateSong,
  isLoading,
  isGeneratingSong,
  genreHistory,
  onRemoveGenre,
}: LyricsTextareaProps) {
  if (isLoading) {
    return (
      <div className="lyrics-container">
        <div className="loading">Genererer sangtekst...</div>
      </div>
    );
  }

  if (!lyrics) {
    return null;
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
        placeholder="Sangteksten vil vises her..."
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
      <button
        onClick={onGenerateSong}
        disabled={!lyrics.trim() || !title.trim() || isGeneratingSong}
        className="generate-song-button"
      >
        {isGeneratingSong ? '⏳ Genererer sang...' : 'Generer Sang med Suno'}
      </button>
    </div>
  );
}

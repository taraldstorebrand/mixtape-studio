interface LyricsTextareaProps {
  lyrics: string;
  onChange: (lyrics: string) => void;
  genre: string;
  onGenreChange: (genre: string) => void;
  onGenerateSong: () => void;
  isLoading: boolean;
  isGeneratingSong: boolean;
}

export function LyricsTextarea({
  lyrics,
  onChange,
  genre,
  onGenreChange,
  onGenerateSong,
  isLoading,
  isGeneratingSong,
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
      <label htmlFor="lyrics-textarea" className="lyrics-label">
        Generert sangtekst (kan redigeres):
      </label>
      <textarea
        id="lyrics-textarea"
        value={lyrics}
        onChange={(e) => onChange(e.target.value)}
        className="lyrics-textarea"
        rows={12}
        placeholder="Sangteksten vil vises her..."
      />
      <div className="genre-input-container">
        <label htmlFor="genre-input" className="genre-label">
          Sjanger/stil (valgfritt):
        </label>
        <input
          id="genre-input"
          type="text"
          value={genre}
          onChange={(e) => onGenreChange(e.target.value)}
          className="genre-input"
          placeholder="f.eks. pop, rock, jazz, electronic..."
        />
      </div>
      <button
        onClick={onGenerateSong}
        disabled={!lyrics.trim() || isGeneratingSong}
        className="generate-song-button"
      >
        {isGeneratingSong ? 'Genererer sang...' : 'Generer Sang med Suno'}
      </button>
    </div>
  );
}

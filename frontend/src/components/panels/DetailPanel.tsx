import { PromptInput } from '../lyrics/PromptInput';
import { LyricsTextarea } from '../lyrics/LyricsTextarea';
import { HistoryItem } from '../../types';

interface DetailPanelProps {
  selectedItem: HistoryItem | null;
  onCopy: () => void;
  currentLyrics: string;
  onLyricsChange: (lyrics: string) => void;
  title: string;
  onTitleChange: (title: string) => void;
  genre: string;
  onGenreChange: (genre: string) => void;
  onGenerateLyrics: (prompt: string) => void;
  onGenerateSong: () => void;
  isLoading: boolean;
  isGeneratingSong: boolean;
  genreHistory: string[];
  onRemoveGenre: (genre: string) => void;
  error: string | null;
}

export function DetailPanel({
  selectedItem,
  onCopy,
  currentLyrics,
  onLyricsChange,
  title,
  onTitleChange,
  genre,
  onGenreChange,
  onGenerateLyrics,
  onGenerateSong,
  isLoading,
  isGeneratingSong,
  genreHistory,
  onRemoveGenre,
  error,
}: DetailPanelProps) {
  return (
    <>
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {selectedItem ? (
        <div className="readonly-view">
          <div className="readonly-header">
            <h2>Valgt sang</h2>
            <button className="copy-button" onClick={onCopy}>
              Kopier
            </button>
          </div>
          <div className="readonly-field">
            <label>ChatGPT-prompt:</label>
            <p>{selectedItem.prompt || '(ingen prompt)'}</p>
          </div>
          <div className="readonly-field">
            <label>Tittel:</label>
            <p>{selectedItem.title}</p>
          </div>
          <div className="readonly-field">
            <label>Sangtekst:</label>
            <pre className="readonly-lyrics">{selectedItem.lyrics}</pre>
          </div>
          {selectedItem.genre && (
            <div className="readonly-field">
              <label>Sjanger:</label>
              <p>{selectedItem.genre}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="generation-section">
          <PromptInput
            onGenerate={onGenerateLyrics}
            isLoading={isLoading}
          />
          
          <LyricsTextarea
            lyrics={currentLyrics}
            onChange={onLyricsChange}
            title={title}
            onTitleChange={onTitleChange}
            genre={genre}
            onGenreChange={onGenreChange}
            onGenerateSong={onGenerateSong}
            isLoading={isLoading}
            isGeneratingSong={isGeneratingSong}
            genreHistory={genreHistory}
            onRemoveGenre={onRemoveGenre}
          />
        </div>
      )}
    </>
  );
}

import { useState, forwardRef, useImperativeHandle } from 'react';
import { PromptInput } from '../lyrics/PromptInput';
import { LyricsTextarea } from '../lyrics/LyricsTextarea';
import { generateLyrics, generateSong } from '../../services/api';
import { HistoryItem } from '../../types';

interface DetailPanelProps {
  selectedItem: HistoryItem | null;
  genreHistory: string[];
  onAddHistoryItem: (item: HistoryItem) => void;
  onAddGenre: (genre: string) => void;
  onRemoveGenre: (genre: string) => void;
  onClearSelection: () => void;
}

export interface DetailPanelHandle {
  notifySongGenerationComplete: () => void;
}

export const DetailPanel = forwardRef<DetailPanelHandle, DetailPanelProps>(function DetailPanel({
  selectedItem,
  genreHistory,
  onAddHistoryItem,
  onAddGenre,
  onRemoveGenre,
  onClearSelection,
}, ref) {
  const [currentLyrics, setCurrentLyrics] = useState('');
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState('');
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingSong, setIsGeneratingSong] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useImperativeHandle(ref, () => ({
    notifySongGenerationComplete: () => {
      setIsGeneratingSong(false);
    },
  }));

  const handleGenerateLyrics = async (inputPrompt: string) => {
    setIsLoading(true);
    setError(null);
    setPrompt(inputPrompt);

    try {
      const lyrics = await generateLyrics(inputPrompt);
      setCurrentLyrics(lyrics);
    } catch (err: any) {
      setError(err.message || 'Kunne ikke generere sangtekst');
      console.error('Error generating lyrics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateSong = async () => {
    if (!currentLyrics.trim() || !title.trim()) return;

    setIsGeneratingSong(true);
    setError(null);

    try {
      const result = await generateSong(currentLyrics, genre || undefined, title);

      if (genre.trim()) {
        onAddGenre(genre.trim());
      }

      const newItem: HistoryItem = {
        id: Date.now().toString(),
        prompt: prompt,
        title: title,
        lyrics: currentLyrics,
        createdAt: new Date().toISOString(),
        sunoJobId: result.jobId,
        sunoStatus: 'pending',
        genre: genre || undefined,
      };
      onAddHistoryItem(newItem);
    } catch (err: any) {
      setError(err.message || 'Kunne ikke generere sang');
      console.error('Error generating song:', err);
      setIsGeneratingSong(false);
    }
  };

  const handleCopy = () => {
    if (selectedItem) {
      setPrompt(selectedItem.prompt || '');
      setTitle(selectedItem.title || '');
      setCurrentLyrics(selectedItem.lyrics || '');
      setGenre(selectedItem.genre || '');
      onClearSelection();
    }
  };

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
            <button className="copy-button" onClick={handleCopy}>
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
            onGenerate={handleGenerateLyrics}
            isLoading={isLoading}
          />

          <LyricsTextarea
            lyrics={currentLyrics}
            onChange={setCurrentLyrics}
            title={title}
            onTitleChange={setTitle}
            genre={genre}
            onGenreChange={setGenre}
            onGenerateSong={handleGenerateSong}
            isLoading={isLoading}
            isGeneratingSong={isGeneratingSong}
            genreHistory={genreHistory}
            onRemoveGenre={onRemoveGenre}
          />
        </div>
      )}
    </>
  );
});

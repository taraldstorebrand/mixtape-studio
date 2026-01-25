import { useState, useCallback, useRef, useEffect } from 'react';
import { PromptInput } from './components/lyrics/PromptInput';
import { LyricsTextarea } from './components/lyrics/LyricsTextarea';
import { HistoryList } from './components/history/HistoryList';
import { generateLyrics, generateSong } from './services/api';
import { useHistory } from './hooks/useHistory';
import { useGenreHistory } from './hooks/useGenreHistory';
import { useSunoSocket, SunoUpdateData } from './hooks/useSunoSocket';
import { HistoryItem } from './types';
import './App.css';

const PANEL_WIDTH_KEY = 'sangtekst_panel_width';

function App() {
  const [currentLyrics, setCurrentLyrics] = useState('');
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState('');
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingSong, setIsGeneratingSong] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [panelWidth, setPanelWidth] = useState(() => {
    const saved = localStorage.getItem(PANEL_WIDTH_KEY);
    return saved ? parseInt(saved, 10) : 50;
  });
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const { history, addHistoryItem, updateHistoryItem, removeHistoryItem, handleFeedback } = useHistory();
  const { genres: genreHistory, addGenre, removeGenre } = useGenreHistory();

  useEffect(() => {
    localStorage.setItem(PANEL_WIDTH_KEY, panelWidth.toString());
  }, [panelWidth]);

  const handleMouseDown = useCallback(() => {
    setIsDragging(true);
  }, []);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const newWidth = ((e.clientX - rect.left) / rect.width) * 100;
      setPanelWidth(Math.min(70, Math.max(30, newWidth)));
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const handleSunoUpdate = useCallback((data: SunoUpdateData) => {
    console.log('Received Suno update:', data);
    
    const historyItem = history.find(item => item.sunoJobId === data.jobId);
    if (historyItem) {
      if (data.status === 'completed') {
        updateHistoryItem(historyItem.id, {
          sunoStatus: 'completed',
          sunoAudioUrls: data.audio_urls,
          sunoLocalUrls: data.local_urls,
        });
        setIsGeneratingSong(false);
      } else if (data.status === 'partial') {
        updateHistoryItem(historyItem.id, {
          sunoStatus: 'partial',
          sunoAudioUrls: data.audio_urls,
        });
      } else if (data.status === 'failed') {
        removeHistoryItem(historyItem.id);
        setIsGeneratingSong(false);
      } else if (data.status === 'pending' && data.audio_urls && data.audio_urls.length > 0) {
        updateHistoryItem(historyItem.id, {
          sunoAudioUrls: data.audio_urls,
        });
      }
    }
  }, [history, updateHistoryItem, removeHistoryItem]);

  useSunoSocket(handleSunoUpdate);

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
        addGenre(genre.trim());
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
      addHistoryItem(newItem);
    } catch (err: any) {
      setError(err.message || 'Kunne ikke generere sang');
      console.error('Error generating song:', err);
      setIsGeneratingSong(false);
    }
  };

  const handleSelect = (item: HistoryItem) => {
    if (selectedItemId === item.id) {
      setSelectedItemId(null);
    } else {
      setSelectedItemId(item.id);
    }
  };

  const handleCopy = () => {
    const selectedItem = history.find(h => h.id === selectedItemId);
    if (selectedItem) {
      setPrompt(selectedItem.prompt || '');
      setTitle(selectedItem.title || '');
      setCurrentLyrics(selectedItem.lyrics || '');
      setGenre(selectedItem.genre || '');
      setSelectedItemId(null);
    }
  };

  const selectedItem = selectedItemId ? history.find(h => h.id === selectedItemId) : null;

  const handleDeleteItem = (id: string) => {
    removeHistoryItem(id);
  };

  const handleDeleteTrack = (id: string, trackIndex: number) => {
    const item = history.find(h => h.id === id);
    if (!item) return;

    const localUrls = item.sunoLocalUrls ? [...item.sunoLocalUrls] : [];
    const audioUrls = item.sunoAudioUrls ? [...item.sunoAudioUrls] : [];
    
    if (localUrls.length > 0) {
      localUrls.splice(trackIndex, 1);
    }
    if (audioUrls.length > 0) {
      audioUrls.splice(trackIndex, 1);
    }

    updateHistoryItem(id, {
      sunoLocalUrls: localUrls,
      sunoAudioUrls: audioUrls,
    });
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Sangtekst Generator</h1>
        <p>Generer sangtekster med ChatGPT og lag musikk med Suno</p>
      </header>

      <main className="app-main" ref={containerRef}>
        <div className="panel-left" style={{ width: `${panelWidth}%` }}>
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
                onRemoveGenre={removeGenre}
              />
            </div>
          )}
        </div>

        <div
          className={`resize-handle ${isDragging ? 'dragging' : ''}`}
          onMouseDown={handleMouseDown}
        />

        <div className="panel-right">
          <HistoryList
            items={history}
            selectedItemId={selectedItemId}
            onFeedback={handleFeedback}
            onSelect={handleSelect}
            onDeleteItem={handleDeleteItem}
            onDeleteTrack={handleDeleteTrack}
          />
        </div>
      </main>
    </div>
  );
}

export default App;

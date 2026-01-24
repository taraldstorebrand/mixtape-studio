import { useState, useCallback, useRef, useEffect } from 'react';
import { PromptInput } from './components/lyrics/PromptInput';
import { LyricsTextarea } from './components/lyrics/LyricsTextarea';
import { HistoryList } from './components/history/HistoryList';
import { generateLyrics, generateSong } from './services/api';
import { useHistory } from './hooks/useHistory';
import { useSunoSocket, SunoUpdateData } from './hooks/useSunoSocket';
import { HistoryItem } from './types';
import './App.css';

const PANEL_WIDTH_KEY = 'sangtekst_panel_width';

function App() {
  const [currentLyrics, setCurrentLyrics] = useState('');
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingSong, setIsGeneratingSong] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [panelWidth, setPanelWidth] = useState(() => {
    const saved = localStorage.getItem(PANEL_WIDTH_KEY);
    return saved ? parseInt(saved, 10) : 50;
  });
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const { history, addHistoryItem, updateHistoryItem, handleFeedback } = useHistory();

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
        updateHistoryItem(historyItem.id, {
          sunoStatus: 'failed',
        });
        setIsGeneratingSong(false);
      } else if (data.status === 'pending' && data.audio_urls && data.audio_urls.length > 0) {
        updateHistoryItem(historyItem.id, {
          sunoAudioUrls: data.audio_urls,
        });
      }
    }
  }, [history, updateHistoryItem]);

  useSunoSocket(handleSunoUpdate);

  const handleGenerateLyrics = async (prompt: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const lyrics = await generateLyrics(prompt);
      setCurrentLyrics(lyrics);
      
      const newItem: HistoryItem = {
        id: Date.now().toString(),
        prompt,
        title: '',
        lyrics,
        createdAt: new Date().toISOString(),
      };
      addHistoryItem(newItem);
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
      
      const newItem: HistoryItem = {
        id: Date.now().toString(),
        prompt: title,
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

  const handleReuse = (item: HistoryItem) => {
    setCurrentLyrics(item.lyrics);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
            />
          </div>
        </div>

        <div
          className={`resize-handle ${isDragging ? 'dragging' : ''}`}
          onMouseDown={handleMouseDown}
        />

        <div className="panel-right">
          <HistoryList
            items={history}
            onFeedback={handleFeedback}
            onReuse={handleReuse}
          />
        </div>
      </main>
    </div>
  );
}

export default App;

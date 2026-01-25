import { useRef } from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { DetailPanel, DetailPanelHandle } from './components/panels/DetailPanel';
import { HistoryPanel } from './components/panels/HistoryPanel';
import { useHistoryAtom, useGenreHistoryAtom, selectedItemIdAtom, selectedItemAtom, songGenerationStatusAtom } from './store';
import { useResizable } from './hooks/useResizable';
import { useSunoSocket, SunoUpdateData } from './hooks/useSunoSocket';
import { HistoryItem } from './types';
import './App.css';

const PANEL_WIDTH_KEY = 'sangtekst_panel_width';

function App() {
  const [selectedItemId, setSelectedItemId] = useAtom(selectedItemIdAtom);
  const selectedItem = useAtomValue(selectedItemAtom);
  const setSongGenerationStatus = useSetAtom(songGenerationStatusAtom);
  const containerRef = useRef<HTMLDivElement>(null);
  const detailPanelRef = useRef<DetailPanelHandle>(null);

  const { history, addHistoryItem, updateHistoryItem, removeHistoryItem, handleFeedback } = useHistoryAtom();
  const { genres: genreHistory, addGenre, removeGenre } = useGenreHistoryAtom();
  const { width: panelWidth, isDragging, handleMouseDown } = useResizable({
    containerRef,
    storageKey: PANEL_WIDTH_KEY,
    defaultWidth: 50,
    minWidth: 30,
    maxWidth: 70,
  });

  const handleSunoUpdate = (data: SunoUpdateData) => {
    console.log('Received Suno update:', data);
    
    const historyItem = history.find(item => item.sunoJobId === data.jobId);
    if (historyItem) {
      if (data.status === 'completed') {
        updateHistoryItem(historyItem.id, {
          sunoStatus: 'completed',
          sunoAudioUrls: data.audio_urls,
          sunoLocalUrls: data.local_urls,
        });
        setSongGenerationStatus('completed');
        detailPanelRef.current?.notifySongGenerationComplete();
      } else if (data.status === 'partial') {
        updateHistoryItem(historyItem.id, {
          sunoStatus: 'partial',
          sunoAudioUrls: data.audio_urls,
        });
      } else if (data.status === 'failed') {
        removeHistoryItem(historyItem.id);
        setSongGenerationStatus('failed');
        detailPanelRef.current?.notifySongGenerationComplete();
      } else if (data.status === 'pending' && data.audio_urls && data.audio_urls.length > 0) {
        updateHistoryItem(historyItem.id, {
          sunoAudioUrls: data.audio_urls,
        });
      }
    }
  };

  useSunoSocket(handleSunoUpdate);

  const handleSelect = (item: HistoryItem) => {
    if (selectedItemId === item.id) {
      setSelectedItemId(null);
    } else {
      setSelectedItemId(item.id);
    }
  };

  const handleClearSelection = () => {
    setSelectedItemId(null);
  };

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
          <DetailPanel
            ref={detailPanelRef}
            selectedItem={selectedItem ?? null}
            genreHistory={genreHistory}
            onAddHistoryItem={addHistoryItem}
            onAddGenre={addGenre}
            onRemoveGenre={removeGenre}
            onClearSelection={handleClearSelection}
          />
        </div>

        <div
          className={`resize-handle ${isDragging ? 'dragging' : ''}`}
          onMouseDown={handleMouseDown}
        />

        <div className="panel-right">
          <HistoryPanel
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

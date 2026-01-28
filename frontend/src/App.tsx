import { useRef } from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { DetailPanel, DetailPanelHandle } from './components/panels/DetailPanel';
import { HistoryPanel } from './components/panels/HistoryPanel';
import { useHistoryAtom, useGenreHistoryAtom, selectedItemIdAtom, selectedItemAtom, songGenerationStatusAtom } from './store';
import { useResizable } from './hooks/useResizable';
import { useSunoSocket, SunoUpdateData } from './hooks/useSunoSocket';
import { HistoryItem } from './types';
import styles from './App.module.css';

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

    // Find all history items with matching jobId (one per variation)
    const matchingItems = history.filter(item => item.sunoJobId === data.jobId);
    if (matchingItems.length === 0) return;

    if (data.status === 'completed') {
      // Update each variation with its corresponding URL
      matchingItems.forEach(item => {
        const index = item.variationIndex ?? 0;
        updateHistoryItem(item.id, {
          sunoStatus: 'completed',
          sunoAudioUrl: data.audio_urls?.[index],
          sunoLocalUrl: data.local_urls?.[index],
          sunoImageUrl: data.image_urls?.[index],
          duration: data.durations?.[index],
        });
      });
      setSongGenerationStatus('completed');
      detailPanelRef.current?.notifySongGenerationComplete();
    } else if (data.status === 'failed') {
      // Remove all variations for this job
      matchingItems.forEach(item => removeHistoryItem(item.id));
      setSongGenerationStatus('failed');
      detailPanelRef.current?.notifySongGenerationComplete();
    } else if (data.status === 'pending') {
      // Update with partial data as it becomes available (e.g. FIRST_SUCCESS)
      matchingItems.forEach(item => {
        const index = item.variationIndex ?? 0;
        const updates: Partial<HistoryItem> = {};
        if (data.audio_urls?.[index]) {
          updates.sunoAudioUrl = data.audio_urls[index];
        }
        if (data.image_urls?.[index]) {
          updates.sunoImageUrl = data.image_urls[index];
        }
        if (data.durations?.[index] != null) {
          updates.duration = data.durations[index];
        }
        if (Object.keys(updates).length > 0) {
          updateHistoryItem(item.id, updates);
        }
      });
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

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1>Mixtape Studio</h1>
        <p>Lag musikk med AI og bygg dine egne mixtapes</p>
      </header>

      <main className={styles.main} ref={containerRef}>
        <div className={styles.panelLeft} style={{ width: `${panelWidth}%` }}>
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
          className={`${styles.resizeHandle} ${isDragging ? styles.resizeHandleDragging : ''}`}
          onMouseDown={handleMouseDown}
        />

        <div className={styles.panelRight}>
          <HistoryPanel
            items={history}
            selectedItemId={selectedItemId}
            onFeedback={handleFeedback}
            onSelect={handleSelect}
            onDeleteItem={handleDeleteItem}
          />
        </div>
      </main>
    </div>
  );
}

export default App;

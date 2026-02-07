import { useRef, useEffect } from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { DetailPanel, DetailPanelHandle } from './components/panels/DetailPanel';
import { HistoryPanel } from './components/panels/HistoryPanel';
import { NowPlayingBar } from './components/nowplaying/NowPlayingBar';
import { ErrorBoundary } from './components/common/ErrorBoundary/ErrorBoundary';
import { ErrorBanner } from './components/common/ErrorBanner/ErrorBanner';
import { useInitializeHistory, useHistoryActions, useGenreHistoryAtom, selectedItemIdAtom, selectedItemAtom, songGenerationStatusAtom, nowPlayingAtom, editorOpenAtom, detailPanelOpenAtom } from './store';
import { useResizable } from './hooks/useResizable';
import { useSunoSocket, SunoUpdateData } from './hooks/useSunoSocket';
import { HistoryItem } from './types';
import { t } from './i18n';
import styles from './App.module.css';

const PANEL_WIDTH_KEY = 'sangtekst_panel_width';

function App() {
  const [selectedItemId, setSelectedItemId] = useAtom(selectedItemIdAtom);
  const selectedItem = useAtomValue(selectedItemAtom);
  const setSongGenerationStatus = useSetAtom(songGenerationStatusAtom);
  const nowPlaying = useAtomValue(nowPlayingAtom);
  const setEditorOpen = useSetAtom(editorOpenAtom);
  const [detailPanelOpen, setDetailPanelOpen] = useAtom(detailPanelOpenAtom);
  const containerRef = useRef<HTMLDivElement>(null);
  const detailPanelRef = useRef<DetailPanelHandle>(null);

  const history = useInitializeHistory();
  const { addHistoryItem, updateHistoryItem, removeHistoryItem, handleFeedback } = useHistoryActions();

  const historyRef = useRef(history);
  useEffect(() => {
    historyRef.current = history;
  }, [history]);

  useEffect(() => {
    if (history.length > 0 && selectedItemId === null) {
      setSelectedItemId(history[0].id);
    }
  }, [history, selectedItemId, setSelectedItemId]);
  const { genres: genreHistory, addGenre, removeGenre } = useGenreHistoryAtom();

  const { width: panelWidth, isDragging, handleMouseDown, handleKeyDown } = useResizable({
    containerRef,
    storageKey: PANEL_WIDTH_KEY,
    defaultWidth: 50,
    minWidth: 30,
    maxWidth: 70,
  });

  const handleSunoUpdate = (data: SunoUpdateData) => {
    if (import.meta.env.DEV) {
      console.log('Received Suno update:', data);
    }

    const matchingItems = historyRef.current.filter(item => item.sunoJobId === data.jobId);
    if (matchingItems.length === 0) return;

    if (data.status === 'completed') {
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
      matchingItems.forEach(item => removeHistoryItem(item.id));
      setSongGenerationStatus('failed');
      detailPanelRef.current?.notifySongGenerationComplete();
    } else if (data.status === 'pending') {
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
      setEditorOpen(false);
    }
  };

  const handleClearSelection = () => {
    setSelectedItemId(null);
  };

  const handleDeleteItem = (id: string) => {
    removeHistoryItem(id);
  };

  const handleSelectItemById = (itemId: string) => {
    const item = history.find(h => h.id === itemId);
    if (item) {
      setSelectedItemId(itemId);
    }
  };

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1>{t.headings.mixtapeStudio}</h1>
        <p>{t.headings.tagline}</p>
      </header>

      <ErrorBanner />

      <ErrorBoundary>
        <main className={styles.main} ref={containerRef}>
          <div className={`${styles.panelLeft} ${detailPanelOpen ? styles.panelLeftOpen : ''}`} style={{ width: `${panelWidth}%` }}>
            <button
              type="button"
              className={styles.closePanelButton}
              onClick={() => setDetailPanelOpen(false)}
              aria-label={t.tooltips.hideDetails}
            >
              <svg aria-hidden="true" focusable="false" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <DetailPanel
              ref={detailPanelRef}
              selectedItem={selectedItem ?? null}
              genreHistory={genreHistory}
              onAddHistoryItem={addHistoryItem}
              onAddGenre={addGenre}
              onRemoveGenre={removeGenre}
              onClearSelection={handleClearSelection}
              nowPlayingItem={nowPlaying ?? null}
              onSelectItem={handleSelectItemById}
              hasHistory={history.length > 0}
            />
          </div>

          <div
            role="separator"
            tabIndex={0}
            className={`${styles.resizeHandle} ${isDragging ? styles.resizeHandleDragging : ''}`}
            onMouseDown={handleMouseDown}
            onKeyDown={handleKeyDown}
            aria-label="Resize panels"
          />

          <div className={styles.panelRight}>
            <button
              type="button"
              className={styles.showDetailsButton}
              onClick={() => setDetailPanelOpen(true)}
              aria-label={t.tooltips.showDetails}
            >
              <svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              {t.tooltips.showDetails}
            </button>
            <HistoryPanel
              items={history}
              selectedItemId={selectedItemId}
              onFeedback={handleFeedback}
              onSelect={handleSelect}
              onDeleteItem={handleDeleteItem}
            />
          </div>
        </main>

        <ErrorBoundary>
          <NowPlayingBar />
        </ErrorBoundary>
      </ErrorBoundary>
    </div>
  );
}

export default App;

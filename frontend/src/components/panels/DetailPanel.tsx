import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { PromptInput } from '../lyrics/PromptInput';
import { LyricsTextarea } from '../lyrics/LyricsTextarea';
import { ReadonlyView } from './DetailPanel/ReadonlyView/ReadonlyView';
import { CollapsibleSection } from './DetailPanel/CollapsibleSection/CollapsibleSection';
import { EmptyState } from './DetailPanel/EmptyState/EmptyState';
import { generateLyrics, generateSong, checkConfigStatus } from '../../services/api';
import { songGenerationStatusAtom, editorOpenAtom } from '../../store';
import { HistoryItem } from '../../types';
import { t } from '../../i18n';
import styles from './DetailPanel.module.css';

interface DetailPanelProps {
  selectedItem: HistoryItem | null;
  genreHistory: string[];
  onAddHistoryItem: (item: HistoryItem) => void;
  onAddGenre: (genre: string) => void;
  onRemoveGenre: (genre: string) => void;
  onClearSelection: () => void;
  nowPlayingItem?: HistoryItem | null;
  onSelectItem?: (itemId: string) => void;
  hasHistory?: boolean;
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
  nowPlayingItem,
  onSelectItem,
  hasHistory = false,
}, ref) {
  const [currentLyrics, setCurrentLyrics] = useState('');
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState('');
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [songGenerationStatus, setSongGenerationStatus] = useAtom(songGenerationStatusAtom);
  const editorOpen = useAtomValue(editorOpenAtom);
  const setEditorOpen = useSetAtom(editorOpenAtom);
  const [error, setError] = useState<string | null>(null);
  const [sunoAvailable, setSunoAvailable] = useState(false);
  const [openaiAvailable, setOpenaiAvailable] = useState(false);
  const [aiAssistEnabled, setAiAssistEnabled] = useState(() => {
    const stored = localStorage.getItem('aiAssistEnabled');
    return stored === 'true';
  });
  const [isLyricsEditExpanded, setIsLyricsEditExpanded] = useState(true);
  const [isPromptEditExpanded, setIsPromptEditExpanded] = useState(true);

  useEffect(() => {
    checkConfigStatus().then((status: { suno: boolean; openai: boolean }) => {
      setSunoAvailable(status.suno);
      setOpenaiAvailable(status.openai);
    });
  }, []);

  const handleAiAssistToggle = (enabled: boolean) => {
    setAiAssistEnabled(enabled);
    localStorage.setItem('aiAssistEnabled', String(enabled));
  };

  useImperativeHandle(ref, () => ({
    notifySongGenerationComplete: () => {
      setSongGenerationStatus('idle');
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
      setError(err.message || t.errors.couldNotGenerateLyrics);
      console.error('Error generating lyrics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateSong = async () => {
    if (!currentLyrics.trim() || !title.trim()) return;

    setSongGenerationStatus('pending');
    setError(null);

    try {
      const result = await generateSong(currentLyrics, genre || undefined, title);

      if (genre.trim()) {
        onAddGenre(genre.trim());
      }

      const timestamp = Date.now();
      const createdAt = new Date().toISOString();

      // Create two history items, one for each Suno variation (D-041)
      for (let i = 0; i < 2; i++) {
        const newItem: HistoryItem = {
          id: `${timestamp}_${i}`,
          prompt: prompt,
          title: title,
          lyrics: currentLyrics,
          createdAt: createdAt,
          sunoJobId: result.jobId,
          sunoStatus: 'pending',
          genre: genre || undefined,
          artist: 'Mixtape Studio AI',
          variationIndex: i,
        };
        onAddHistoryItem(newItem);
      }
    } catch (err: any) {
      setError(err.message || t.errors.couldNotGenerateSong);
      console.error('Error generating song:', err);
      setSongGenerationStatus('failed');
    }
  };

  const handleCopy = () => {
    if (selectedItem) {
      setPrompt(selectedItem.prompt || '');
      setTitle(selectedItem.title || '');
      setCurrentLyrics(selectedItem.lyrics || '');
      setGenre(selectedItem.genre || '');
      setIsLyricsEditExpanded(true);
      setIsPromptEditExpanded(true);
      setEditorOpen(true);
    }
  };

  const handleNewDraft = () => {
    setPrompt('');
    setTitle('');
    setCurrentLyrics('');
    setGenre('');
    setError(null);
    setIsLyricsEditExpanded(true);
    setIsPromptEditExpanded(true);
    setEditorOpen(true);
  };

  const isBlank = !currentLyrics.trim() && !title.trim() && !genre.trim() && !prompt.trim();

  return (
    <>
      {error && (
        <div className={styles.errorMessage}>
          {error}
        </div>
      )}

      {!editorOpen && selectedItem ? (
        <ReadonlyView
          item={selectedItem}
          onCopy={handleCopy}
          nowPlayingItem={nowPlayingItem}
          onSelectItem={onSelectItem}
        />
      ) : !editorOpen && !selectedItem && !hasHistory ? (
        <EmptyState sunoAvailable={sunoAvailable} hasHistory={hasHistory} />
      ) : (
        <div className={styles.generationSection}>
          <div className={styles.primaryActionContainer}>
            <button
              type="button"
              onClick={handleGenerateSong}
              disabled={!sunoAvailable || !currentLyrics.trim() || !title.trim() || songGenerationStatus === 'pending'}
              className={styles.generateSongButton}
              aria-label={t.actions.generateSong}
            >
              {songGenerationStatus === 'pending' ? <span className={styles.buttonLoading}><span className={styles.spinner} />{t.actions.generatingSong}</span> : t.actions.generateSong}
            </button>
            {!sunoAvailable && (
              <p className={styles.sunoMissingHint}>{t.errors.sunoApiKeyMissing}</p>
            )}
          </div>
          {!isBlank && (
            <button type="button" className={styles.newDraftButton} onClick={handleNewDraft}>
              {t.actions.newDraft}
            </button>
          )}
          {selectedItem && (
            <button type="button" className={styles.newDraftButton} onClick={() => setEditorOpen(false)}>
              {t.actions.backToDetails}
            </button>
          )}

          <CollapsibleSection
            label={t.labels.lyrics}
            isExpanded={isLyricsEditExpanded}
            onToggle={() => setIsLyricsEditExpanded(!isLyricsEditExpanded)}
            mode="edit"
          >
            <div className={styles.lyricsEditContainer}>
              <LyricsTextarea
                lyrics={currentLyrics}
                onChange={setCurrentLyrics}
                title={title}
                onTitleChange={setTitle}
                genre={genre}
                onGenreChange={setGenre}
                isLoading={isLoading}
                genreHistory={genreHistory}
                onRemoveGenre={onRemoveGenre}
              />
            </div>
          </CollapsibleSection>

          <CollapsibleSection
            label={t.labels.chatGptPrompt}
            isExpanded={isPromptEditExpanded}
            onToggle={() => setIsPromptEditExpanded(!isPromptEditExpanded)}
            mode="edit"
          >
            <div className={styles.aiAssistSection}>
              <label className={styles.aiToggleLabel}>
                <input
                  type="checkbox"
                  checked={aiAssistEnabled && openaiAvailable}
                  onChange={(e) => handleAiAssistToggle(e.target.checked)}
                  disabled={!openaiAvailable}
                  className={styles.aiToggleCheckbox}
                />
                {t.labels.useAiToGenerateLyrics}
              </label>
              {!openaiAvailable && (
                <p className={styles.sunoMissingHint}>{t.errors.openaiApiKeyMissing}</p>
              )}

              {aiAssistEnabled && openaiAvailable && (
                <PromptInput
                  onGenerate={handleGenerateLyrics}
                  isLoading={isLoading}
                  initialValue={prompt}
                />
              )}
            </div>
          </CollapsibleSection>
        </div>
      )}
    </>
  );
});

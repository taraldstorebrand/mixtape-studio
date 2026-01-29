import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useAtom } from 'jotai';
import { PromptInput } from '../lyrics/PromptInput';
import { LyricsTextarea } from '../lyrics/LyricsTextarea';
import { ReadonlyView } from './DetailPanel/ReadonlyView/ReadonlyView';
import { generateLyrics, generateSong, checkConfigStatus } from '../../services/api';
import { songGenerationStatusAtom } from '../../store';
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
  const [songGenerationStatus, setSongGenerationStatus] = useAtom(songGenerationStatusAtom);
  const [error, setError] = useState<string | null>(null);
  const [sunoAvailable, setSunoAvailable] = useState(true);
  const [openaiAvailable, setOpenaiAvailable] = useState(true);
  const [aiAssistEnabled, setAiAssistEnabled] = useState(() => {
    const stored = localStorage.getItem('aiAssistEnabled');
    return stored === 'true';
  });

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
      onClearSelection();
    }
  };

  const handleNewDraft = () => {
    setPrompt('');
    setTitle('');
    setCurrentLyrics('');
    setGenre('');
    setError(null);
    onClearSelection();
  };

  const isBlank = !currentLyrics.trim() && !title.trim() && !genre.trim() && !prompt.trim();

  return (
    <>
      {error && (
        <div className={styles.errorMessage}>
          {error}
        </div>
      )}

      {selectedItem ? (
        <ReadonlyView
          item={selectedItem}
          onCopy={handleCopy}
          onClearSelection={onClearSelection}
        />
      ) : (
        <div className={styles.generationSection}>
          <div className={styles.primaryActionContainer}>
            <button
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
            <button className={styles.newDraftButton} onClick={handleNewDraft}>
              {t.actions.newDraft}
            </button>
          )}

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
        </div>
      )}
    </>
  );
});

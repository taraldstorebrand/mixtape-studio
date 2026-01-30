import { useAtomValue } from 'jotai';
import type { HistoryItem } from '../../../../types';
import { t } from '../../../../i18n';
import { isPlayingAtom } from '../../../../store';
import styles from '../../DetailPanel.module.css';

interface ReadonlyViewProps {
  item: HistoryItem;
  onCopy: () => void;
  onClearSelection: () => void;
  nowPlayingItem?: HistoryItem | null;
  onSelectItem?: (itemId: string) => void;
}

export function ReadonlyView({ item, onCopy, onClearSelection, nowPlayingItem, onSelectItem }: ReadonlyViewProps) {
  const isPlaying = useAtomValue(isPlayingAtom);

  // Show indicator if a different song is playing
  const showNowPlayingIndicator =
    isPlaying &&
    nowPlayingItem &&
    nowPlayingItem.id !== item.id;

  const handleNowPlayingClick = () => {
    if (nowPlayingItem && onSelectItem) {
      onSelectItem(nowPlayingItem.id);
    }
  };
  return (
    <div className={styles.readonlyView}>
      <button type="button" className={styles.newDraftButton} onClick={onClearSelection}>
        {t.actions.newDraft}
      </button>
      <div className={styles.readonlyHeader}>
        <div className={styles.readonlyTitleRow}>
          <h2 className={styles.readonlyTitle} title={item.title}>{item.title}</h2>
          <button type="button" className={styles.copyButton} onClick={onCopy} aria-label={t.actions.copy}>
            <svg aria-hidden="true" focusable="false" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          </button>
        </div>
        {item.genre && <span className={styles.readonlyGenre}>{item.genre}</span>}
        {showNowPlayingIndicator && nowPlayingItem && (
          <button
            type="button"
            className={styles.nowPlayingIndicator}
            onClick={handleNowPlayingClick}
            aria-label={t.messages.nowPlaying(nowPlayingItem.title || t.messages.untitled)}
          >
            {t.messages.nowPlaying(nowPlayingItem.title || t.messages.untitled)}
          </button>
        )}
      </div>
      <div className={styles.readonlyCoverImage}>
        <img src={item.sunoImageUrl || '/assets/placeholder.png'} alt={item.title} />
      </div>
      {item.prompt && (
        <div className={styles.readonlyField}>
          <label>{t.labels.chatGptPrompt}</label>
          <p>{item.prompt}</p>
        </div>
      )}
      {item.lyrics && (
        <div className={styles.readonlyField}>
          <label>{t.labels.lyrics}</label>
          <pre className={styles.readonlyLyrics}>{item.lyrics}</pre>
        </div>
      )}
    </div>
  );
}

import type { HistoryItem } from '../../../../types';
import { t } from '../../../../i18n';
import styles from '../../DetailPanel.module.css';

interface ReadonlyViewProps {
  item: HistoryItem;
  onCopy: () => void;
  onClearSelection: () => void;
}

export function ReadonlyView({ item, onCopy, onClearSelection }: ReadonlyViewProps) {
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
      <div className={styles.readonlyField}>
        <label>{t.labels.lyrics}</label>
        <pre className={styles.readonlyLyrics}>{item.lyrics}</pre>
      </div>
    </div>
  );
}

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
      <button className={styles.newDraftButton} onClick={onClearSelection}>
        {t.actions.newDraft}
      </button>
      <div className={styles.readonlyHeader}>
        <h2>{t.headings.selectedSong}</h2>
        <button className={styles.copyButton} onClick={onCopy}>
          {t.actions.copy}
        </button>
      </div>
      <div className={styles.readonlyCoverImage}>
        <img src={item.sunoImageUrl || '/assets/placeholder.png'} alt={item.title} />
      </div>
      <div className={styles.readonlyField}>
        <label>{t.labels.chatGptPrompt}</label>
        <p>{item.prompt || t.messages.noPrompt}</p>
      </div>
      <div className={styles.readonlyField}>
        <label>{t.labels.title}</label>
        <p>{item.title}</p>
      </div>
      <div className={styles.readonlyField}>
        <label>{t.labels.lyrics}</label>
        <pre className={styles.readonlyLyrics}>{item.lyrics}</pre>
      </div>
      {item.genre && (
        <div className={styles.readonlyField}>
          <label>{t.labels.genre}</label>
          <p>{item.genre}</p>
        </div>
      )}
    </div>
  );
}

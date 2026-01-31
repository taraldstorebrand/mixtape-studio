import { useSetAtom } from 'jotai';
import { editorOpenAtom } from '../../../../store';
import { t } from '../../../../i18n';
import styles from '../../DetailPanel.module.css';

interface EmptyStateProps {
  sunoAvailable: boolean;
  hasHistory: boolean;
}

export function EmptyState({ sunoAvailable, hasHistory }: EmptyStateProps) {
  const setEditorOpen = useSetAtom(editorOpenAtom);

  if (!hasHistory && !sunoAvailable) {
    return (
      <div className={styles.emptyState}>
        <p>{t.messages.uploadToStart}</p>
      </div>
    );
  }

  if (!hasHistory && sunoAvailable) {
    return (
      <div className={styles.emptyState}>
        <button
          type="button"
          className={styles.newDraftButton}
          onClick={() => setEditorOpen(true)}
        >
          {t.messages.createFirstSong}
        </button>
      </div>
    );
  }

  return null;
}

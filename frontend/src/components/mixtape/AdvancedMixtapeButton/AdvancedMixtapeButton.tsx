import { useState } from 'react';
import { Modal } from '../../common/Modal';
import { MixtapeEditor } from '../MixtapeEditor';
import type { HistoryItem } from '../../../types';
import { t } from '../../../i18n';
import styles from './AdvancedMixtapeButton.module.css';

interface AdvancedMixtapeButtonProps {
  allSongs: HistoryItem[];
}

export function AdvancedMixtapeButton({ allSongs }: AdvancedMixtapeButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const completedSongs = allSongs.filter(
    (song) => song.sunoStatus === 'completed' && song.sunoLocalUrl
  );
  const hasCompletedSongs = completedSongs.length > 0;

  return (
    <>
      <button
        type="button"
        className={styles.link}
        onClick={() => setIsOpen(true)}
        disabled={!hasCompletedSongs}
        title={hasCompletedSongs ? t.tooltips.createAdvancedMixtape : t.tooltips.noSongsAvailable}
      >
        {t.actions.advanced}
      </button>
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={t.actions.createMixtape}
      >
        <MixtapeEditor allSongs={allSongs} onClose={() => setIsOpen(false)} />
      </Modal>
    </>
  );
}

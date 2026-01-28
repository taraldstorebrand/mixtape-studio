import { useState } from 'react';
import { Modal } from '../../common/Modal';
import { MixtapeEditor } from '../MixtapeEditor';
import type { HistoryItem } from '../../../types';
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
        title={hasCompletedSongs ? 'Lag avansert mixtape' : 'Ingen sanger tilgjengelig'}
      >
        Avansert
      </button>
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Lag Mixtape"
      >
        <MixtapeEditor allSongs={allSongs} onClose={() => setIsOpen(false)} />
      </Modal>
    </>
  );
}

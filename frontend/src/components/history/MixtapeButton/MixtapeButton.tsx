import { useState } from 'react';
import {
  startMixtapeGeneration,
  downloadMixtape,
  onceMixtapeReady,
} from '../../../services/api';
import type { HistoryItem } from '../../../types';
import styles from './MixtapeButton.module.css';

function formatDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

interface MixtapeButtonProps {
  likedItems: HistoryItem[];
}

export function MixtapeButton({ likedItems }: MixtapeButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasLikedSongs = likedItems.length > 0;
  const totalDuration = likedItems.reduce((sum, item) => sum + (item.duration ?? 0), 0);

  async function handleClick() {
    setIsLoading(true);
    setError(null);

    try {
      const taskId = await startMixtapeGeneration();

      onceMixtapeReady(taskId, async (data) => {
        if (data.error) {
          setIsLoading(false);
          setError(data.error);
          return;
        }

        if (data.downloadId) {
          try {
            await downloadMixtape(data.downloadId);
          } catch (downloadErr: any) {
            setError(downloadErr.message || 'Kunne ikke laste ned mixtape');
          }
        }
        setIsLoading(false);
      });
    } catch (err: any) {
      setIsLoading(false);
      setError(err.message || 'Kunne ikke starte mixtape-generering');
    }
  }

  const songCount = likedItems.length;
  const label = isLoading
    ? 'Lager mixtape...'
    : songCount > 0 && totalDuration > 0
      ? `Lag mixtape (${songCount} sanger · ${formatDuration(totalDuration)})`
      : songCount > 0
        ? `Lag mixtape (${songCount} sanger)`
        : 'Lag mixtape av likte sanger';

  return (
    <div>
      <button
        className={styles.mixtapeButton}
        onClick={handleClick}
        disabled={!hasLikedSongs || isLoading}
      >
        {isLoading ? <span className={styles.buttonLoading}><span className={styles.spinner} />{label}</span> : label}
      </button>
      {error && <div className={styles.error}>{error}</div>}
    </div>
  );
}

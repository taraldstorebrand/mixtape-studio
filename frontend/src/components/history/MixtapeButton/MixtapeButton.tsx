import { useState } from 'react';
import {
  startMixtapeGeneration,
  downloadMixtape,
  onceMixtapeReady,
} from '../../../services/api';
import { t } from '../../../i18n';
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
  playlistId?: string;
}

export function MixtapeButton({ likedItems, playlistId }: MixtapeButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasLikedSongs = likedItems.length > 0;
  const totalDuration = likedItems.reduce((sum, item) => sum + (item.duration ?? 0), 0);

  async function handleClick() {
    setIsLoading(true);
    setError(null);

    try {
      const taskId = await startMixtapeGeneration(playlistId);

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
            setError(downloadErr.message || t.errors.couldNotDownloadMixtape);
          }
        }
        setIsLoading(false);
      });
    } catch (err: any) {
      setIsLoading(false);
      setError(err.message || t.errors.couldNotStartMixtapeGeneration);
    }
  }

  const songCount = likedItems.length;
  const label = isLoading
    ? t.actions.creatingMixtape
    : songCount > 0 && totalDuration > 0
      ? t.actions.makeMixtape(songCount, formatDuration(totalDuration))
      : songCount > 0
        ? t.actions.makeMixtape(songCount)
        : t.actions.makeMixtapeFromLiked;

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

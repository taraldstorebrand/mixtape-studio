import { useEffect, useRef, useState } from 'react';
import {
  startMixtapeGeneration,
  downloadMixtape,
  getMixtapeStatus,
} from '../../../services/api';
import { useMixtapeReady } from '../../../hooks/useSse';
import { t } from '../../../i18n';
import type { HistoryItem } from '../../../types';
import styles from './MixtapeButton.module.css';

// Fallback polling interval in case the SSE event is missed (e.g. phone screen off)
const STATUS_POLL_INTERVAL_MS = 3000;

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
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const handledTaskIdRef = useRef<string | null>(null);

  const hasLikedSongs = likedItems.length > 0;
  const totalDuration = likedItems.reduce((sum, item) => sum + (item.duration ?? 0), 0);

  // Handles the result once, whether it arrives via SSE or via polling
  const handleResult = (taskId: string, data: { downloadId?: string; fileName?: string; error?: string }) => {
    if (handledTaskIdRef.current === taskId) return;
    handledTaskIdRef.current = taskId;
    if (data.error) {
      setError(data.error);
    } else if (data.downloadId) {
      downloadMixtape(data.downloadId, data.fileName);
    }
    setIsLoading(false);
    setCurrentTaskId(null);
  };

  useMixtapeReady(currentTaskId || '', (data) => {
    if (currentTaskId) handleResult(currentTaskId, data);
  });

  useEffect(() => {
    if (!currentTaskId) return;
    const taskId = currentTaskId;
    const interval = setInterval(async () => {
      try {
        const status = await getMixtapeStatus(taskId);
        if (status.status !== 'pending') {
          handleResult(taskId, status);
        }
      } catch (err: any) {
        handleResult(taskId, { error: err.message || t.errors.couldNotDownloadMixtape });
      }
    }, STATUS_POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [currentTaskId]);

  async function handleClick() {
    setIsLoading(true);
    setError(null);

    try {
      const taskId = await startMixtapeGeneration(playlistId);
      setCurrentTaskId(taskId);
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

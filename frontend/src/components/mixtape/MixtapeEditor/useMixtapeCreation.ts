import { useState, useEffect, useRef } from 'react';
import {
  startCustomMixtapeGeneration,
  onceMixtapeReady,
  downloadMixtape,
} from '../../../services/api';

interface UseMixtapeCreationOptions {
  onSuccess: () => void;
}

export function useMixtapeCreation({ onSuccess }: UseMixtapeCreationOptions) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const createMixtape = async (songIds: string[], name: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const taskId = await startCustomMixtapeGeneration(songIds, name);

      onceMixtapeReady(taskId, async (data) => {
        if (!mountedRef.current) return;

        if (data.error) {
          setIsLoading(false);
          setError(data.error);
          return;
        }

        if (data.downloadId) {
          try {
            await downloadMixtape(data.downloadId, data.fileName);
            if (!mountedRef.current) return;
            setIsLoading(false);
            onSuccess();
          } catch (downloadErr: unknown) {
            if (!mountedRef.current) return;
            const message = downloadErr instanceof Error ? downloadErr.message : 'Kunne ikke laste ned mixtape';
            setError(message);
            setIsLoading(false);
          }
        } else {
          setIsLoading(false);
        }
      });
    } catch (err: unknown) {
      if (!mountedRef.current) return;
      const message = err instanceof Error ? err.message : 'Kunne ikke starte mixtape-generering';
      setIsLoading(false);
      setError(message);
    }
  };

  return { isLoading, error, createMixtape };
}

import { useState } from 'react';
import {
  startMixtapeGeneration,
  downloadMixtape,
  onceMixtapeReady,
} from '../../../services/api';

interface MixtapeButtonProps {
  hasLikedSongs: boolean;
}

export function MixtapeButton({ hasLikedSongs }: MixtapeButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setIsLoading(true);
    setError(null);

    try {
      const taskId = await startMixtapeGeneration();

      onceMixtapeReady(taskId, (data) => {
        setIsLoading(false);

        if (data.error) {
          setError(data.error);
          return;
        }

        if (data.downloadUrl) {
          downloadMixtape(data.downloadUrl);
        }
      });
    } catch (err: any) {
      setIsLoading(false);
      setError(err.message || 'Kunne ikke starte mixtape-generering');
    }
  }

  return (
    <div>
      <button
        className="mixtape-button"
        onClick={handleClick}
        disabled={!hasLikedSongs || isLoading}
      >
        {isLoading ? 'Lager mixtape...' : 'Lag mixtape av likte sanger'}
      </button>
      {error && <div className="mixtape-error">{error}</div>}
    </div>
  );
}

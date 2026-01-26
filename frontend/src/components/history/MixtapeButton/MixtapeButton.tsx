import { useState } from 'react';
import { downloadLikedMixtape } from '../../../services/api';

interface MixtapeButtonProps {
  hasLikedSongs: boolean;
}

export function MixtapeButton({ hasLikedSongs }: MixtapeButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleClick() {
    setIsLoading(true);
    try {
      await downloadLikedMixtape();
    } catch (error) {
      console.error('Mixtape error:', error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <button
      className="mixtape-button"
      onClick={handleClick}
      disabled={!hasLikedSongs || isLoading}
    >
      {isLoading ? 'Lager mixtape...' : 'Lag mixtape av likte sanger'}
    </button>
  );
}

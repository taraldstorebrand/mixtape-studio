import { useEffect } from 'react';
import { connectSocket, disconnectSocket, onSunoUpdate, offSunoUpdate } from '../services/api';

export interface SunoUpdateData {
  jobId: string;
  status: string;
  audio_urls?: string[];
  local_urls?: string[];
  image_urls?: string[];
  durations?: number[];
  error?: string;
}

export function useSunoSocket(onUpdate: (data: SunoUpdateData) => void) {
  useEffect(() => {
    connectSocket();

    onSunoUpdate(onUpdate);

    return () => {
      offSunoUpdate(onUpdate);
      disconnectSocket();
    };
  }, [onUpdate]);
}

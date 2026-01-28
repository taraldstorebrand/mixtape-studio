import { useEffect, useRef } from 'react';
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
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;

  useEffect(() => {
    const handler = (data: SunoUpdateData) => onUpdateRef.current(data);

    connectSocket();
    onSunoUpdate(handler);

    return () => {
      offSunoUpdate(handler);
      disconnectSocket();
    };
  }, []);
}

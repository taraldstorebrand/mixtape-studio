import { useEffect, useRef } from 'react';

let eventSource: EventSource | null = null;

function getEventSource(): EventSource {
  if (!eventSource) {
    eventSource = new EventSource('/api/events');

    eventSource.onopen = () => {
      if (import.meta.env.DEV) {
        console.log('SSE connection opened');
      }
    };

    eventSource.onerror = (error) => {
      if (import.meta.env.DEV) {
        console.error('SSE connection error:', error);
      }
    };
  }
  return eventSource;
}

export interface SunoUpdateData {
  jobId: string;
  status: string;
  audio_urls?: string[];
  local_urls?: string[];
  image_urls?: string[];
  durations?: number[];
  error?: string;
}

export function useSunoUpdates(onUpdate: (data: SunoUpdateData) => void) {
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;

  useEffect(() => {
    const es = getEventSource();

    const handler = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        onUpdateRef.current(data);
      } catch (error) {
        console.error('Error parsing suno-update event:', error);
      }
    };

    es.addEventListener('suno-update', handler);

    return () => {
      es.removeEventListener('suno-update', handler);
    };
  }, []);
}

export function useMixtapeReady(
  taskId: string,
  callback: (data: { downloadId?: string; fileName?: string; error?: string }) => void
) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    if (!taskId) return;

    const es = getEventSource();

    const handler = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        if (data.taskId === taskId) {
          callbackRef.current(data);
        }
      } catch (error) {
        console.error('Error parsing mixtape-ready event:', error);
      }
    };

    es.addEventListener('mixtape-ready', handler);

    return () => {
      es.removeEventListener('mixtape-ready', handler);
    };
  }, [taskId]);
}

import { io, Socket } from 'socket.io-client';
import type { HistoryItem } from '../../../shared/types';

const API_BASE_URL = '/api';

// Socket.IO client
let socket: Socket | null = null;

export function connectSocket() {
  if (!socket) {
    socket = io('http://localhost:3001');
    
    socket.on('connect', () => {
      console.log('Connected to WebSocket');
    });
    
    socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket');
    });
  }
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function onSunoUpdate(callback: (data: { jobId: string; status: string; audio_urls?: string[]; local_urls?: string[]; error?: string }) => void) {
  if (socket) {
    socket.on('suno-update', callback);
  }
}

export function offSunoUpdate(callback?: (data: any) => void) {
  if (socket) {
    if (callback) {
      socket.off('suno-update', callback);
    } else {
      socket.off('suno-update');
    }
  }
}

export function onceMixtapeReady(
  taskId: string,
  callback: (data: { downloadUrl?: string; error?: string }) => void
) {
  const s = connectSocket();

  function handler(data: {
    taskId: string;
    downloadUrl?: string;
    error?: string;
  }) {
    if (data.taskId === taskId) {
      s.off('mixtape-ready', handler);
      callback(data);
    }
  }

  s.on('mixtape-ready', handler);
}

export async function generateLyrics(prompt: string): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/chatgpt/generate-lyrics`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Kunne ikke generere sangtekst');
  }

  const data = await response.json();
  return data.lyrics;
}

export async function generateSong(lyrics: string, genre?: string, title?: string): Promise<{ jobId: string; status: string }> {
  const response = await fetch(`${API_BASE_URL}/suno/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ lyrics, genre, title }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Kunne ikke generere sang');
  }

  const data = await response.json();
  return data;
}

export async function getSongStatus(jobId: string): Promise<{ status: string; audio_urls?: string[]; error?: string }> {
  const response = await fetch(`${API_BASE_URL}/suno/status/${jobId}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Kunne ikke hente status');
  }

  const data = await response.json();
  return data;
}

// History API

export async function fetchHistory(): Promise<HistoryItem[]> {
  const response = await fetch(`${API_BASE_URL}/history`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Kunne ikke hente historikk');
  }

  return response.json();
}

export async function createHistoryItem(item: HistoryItem): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/history`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(item),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Kunne ikke opprette historikk-element');
  }
}

export async function createHistoryItemsBulk(items: HistoryItem[]): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/history/bulk`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(items),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Kunne ikke opprette historikk-elementer');
  }
}

export async function updateHistoryItem(id: string, updates: Partial<HistoryItem>): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/history/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Kunne ikke oppdatere historikk-element');
  }
}

export async function deleteHistoryItem(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/history/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Kunne ikke slette historikk-element');
  }
}

// Genre API

export async function fetchGenres(): Promise<string[]> {
  const response = await fetch(`${API_BASE_URL}/genres`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Kunne ikke hente sjangre');
  }

  return response.json();
}

export async function addGenre(genre: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/genres`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ genre }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Kunne ikke legge til sjanger');
  }
}

export async function removeGenre(genre: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/genres/${encodeURIComponent(genre)}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Kunne ikke fjerne sjanger');
  }
}

// Mixtape API

export async function startMixtapeGeneration(): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/mixtape/liked`, {
    method: 'POST',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Kunne ikke starte mixtape-generering');
  }

  const data = await response.json();
  return data.taskId;
}

export function downloadMixtape(downloadUrl: string): void {
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = 'mixtape_likte_sanger.m4b';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

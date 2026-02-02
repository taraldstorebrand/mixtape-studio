import { io, Socket } from 'socket.io-client';
import type { HistoryItem } from '../../../shared/types';
import { t } from '../i18n';

const API_BASE_URL = '/api';

// Socket.IO client
let socket: Socket | null = null;

export function connectSocket() {
  console.log('Connecting to WebSocket...');
  if (!socket) {
    // Bruk samme origin (går via Vite proxy)
    socket = io({
      transports: ['websocket', 'polling'], // Websocket først
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity,
    });
    
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
  console.log('Disconnecting from WebSocket...');
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
  callback: (data: { downloadId?: string; fileName?: string; error?: string }) => void
) {
  const s = connectSocket();

  function handler(data: {
    taskId: string;
    downloadId?: string;
    fileName?: string;
    error?: string;
  }) {
    if (data.taskId === taskId) {
      s.off('mixtape-ready', handler);
      callback(data);
    }
  }

  s.on('mixtape-ready', handler);
}

export async function checkConfigStatus(): Promise<{ openai: boolean; suno: boolean }> {
  try {
    const response = await fetch(`${API_BASE_URL}/config-status`);
    if (!response.ok) return { openai: false, suno: false };
    const data = await response.json();
    return { openai: !!data.openai, suno: !!data.suno };
  } catch {
    return { openai: false, suno: false };
  }
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
    throw new Error(error.error || t.errors.couldNotGenerateLyrics);
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
    throw new Error(error.error || t.errors.couldNotGenerateSong);
  }

  const data = await response.json();
  return data;
}

export async function getSongStatus(jobId: string): Promise<{ status: string; audio_urls?: string[]; error?: string }> {
  const response = await fetch(`${API_BASE_URL}/suno/status/${jobId}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || t.errors.couldNotFetchStatus);
  }

  const data = await response.json();
  return data;
}

// History API

export async function fetchHistory(): Promise<HistoryItem[]> {
  const response = await fetch(`${API_BASE_URL}/history`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || t.errors.couldNotFetchHistory);
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
    throw new Error(error.error || t.errors.couldNotCreateHistoryItem);
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
    throw new Error(error.error || t.errors.couldNotUpdateHistoryItem);
  }
}

export async function deleteHistoryItem(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/history/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || t.errors.couldNotDeleteHistoryItem);
  }
}

// Genre API

export async function fetchGenres(): Promise<string[]> {
  const response = await fetch(`${API_BASE_URL}/genres`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || t.errors.couldNotFetchGenres);
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
    throw new Error(error.error || t.errors.couldNotAddGenre);
  }
}

export async function removeGenre(genre: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/genres/${encodeURIComponent(genre)}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || t.errors.couldNotRemoveGenre);
  }
}

// Mixtape API

export async function startMixtapeGeneration(playlistId?: string): Promise<string> {
  const url = playlistId ? `${API_BASE_URL}/mixtape/playlist/${playlistId}` : `${API_BASE_URL}/mixtape/liked`;
  const response = await fetch(url, {
    method: 'POST',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || t.errors.couldNotStartMixtapeGeneration);
  }

  const data = await response.json();
  return data.taskId;
}

export async function startCustomMixtapeGeneration(
  songIds: string[],
  name?: string
): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/mixtape/custom`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ songIds, name }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || t.errors.couldNotStartMixtapeGeneration);
  }

  const data = await response.json();
  return data.taskId;
}

export async function downloadMixtape(downloadId: string, fileName?: string): Promise<void> {
  const url = fileName
    ? `${API_BASE_URL}/mixtape/download/${downloadId}?fileName=${encodeURIComponent(fileName)}`
    : `${API_BASE_URL}/mixtape/download/${downloadId}`;

  const response = await fetch(url);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || t.errors.couldNotDownloadMixtape);
  }

  const blob = await response.blob();
  const blobUrl = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = fileName || 'mixtape_likte_sanger.m4b';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  URL.revokeObjectURL(blobUrl);
}

// Upload API

export async function uploadMp3Files(
  files: File[],
  titles: string[]
): Promise<{ id: string; localUrl: string; duration?: number; imageUrl: string }[]> {
  const formData = new FormData();
  files.forEach((file) => formData.append('files', file));
  formData.append('titles', JSON.stringify(titles));

  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || t.errors.couldNotUploadFiles);
  }

  const data = await response.json();
  return data.items;
}

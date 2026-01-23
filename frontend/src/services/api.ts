import { io, Socket } from 'socket.io-client';

const API_BASE_URL = '/api';

// Socket.IO client
let socket: Socket | null = null;

export function connectSocket() {
  if (!socket) {
    socket = io(window.location.origin);
    
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

export function onSunoUpdate(callback: (data: { jobId: string; status: string; audio_urls?: string[]; error?: string }) => void) {
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

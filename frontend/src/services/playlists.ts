import type { Playlist, PlaylistWithSongs } from '../../../shared/types';

const API_BASE_URL = '/api';

export async function fetchPlaylists(): Promise<Playlist[]> {
  const response = await fetch(`${API_BASE_URL}/playlists`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Could not fetch playlists');
  }

  return response.json();
}

export async function fetchPlaylist(id: string): Promise<PlaylistWithSongs> {
  const response = await fetch(`${API_BASE_URL}/playlists/${id}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Could not fetch playlist');
  }

  return response.json();
}

export async function createPlaylist(name: string): Promise<{ id: string }> {
  const response = await fetch(`${API_BASE_URL}/playlists`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Could not create playlist');
  }

  const data = await response.json();
  return { id: data.id };
}

export async function updatePlaylist(id: string, updates: Partial<{ name: string }>): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/playlists/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Could not update playlist');
  }
}

export async function deletePlaylist(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/playlists/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Could not delete playlist');
  }
}

export async function addSongsToPlaylist(id: string, songIds: string[]): Promise<{ entryIds: string[] }> {
  const response = await fetch(`${API_BASE_URL}/playlists/${id}/songs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ songIds }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Could not add songs to playlist');
  }

  const data = await response.json();
  return { entryIds: data.entryIds };
}

export async function removeSongFromPlaylist(id: string, entryId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/playlists/${id}/songs/${entryId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Could not remove song from playlist');
  }
}

export async function reorderPlaylistSongs(id: string, entryIds: string[]): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/playlists/${id}/songs/reorder`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ entryIds }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Could not reorder playlist songs');
  }
}

export async function uploadPlaylistCover(id: string, file: File): Promise<{ coverImageUrl: string }> {
  const formData = new FormData();
  formData.append('cover', file);

  const response = await fetch(`${API_BASE_URL}/playlists/${id}/cover`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Could not upload playlist cover');
  }

  return response.json();
}

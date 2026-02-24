import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import {
  getAllPlaylists,
  getPlaylistById,
  createPlaylist,
  updatePlaylist,
  deletePlaylist,
  addSongsToPlaylist,
  removeSongFromPlaylist,
  reorderPlaylistSongs,
  getPlaylistCount,
  getPlaylistSongCount,
} from '../db';

const router = Router();
const PLAYLIST_LIMIT = 100;
const PLAYLIST_SONGS_LIMIT = 100;

const playlistImagesDir = path.join(__dirname, '../../images/playlists');
if (!fs.existsSync(playlistImagesDir)) {
  fs.mkdirSync(playlistImagesDir, { recursive: true });
}

const coverStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, playlistImagesDir),
  filename: (req, file, cb) => {
    const ext = file.mimetype === 'image/png' ? '.png' : '.jpg';
    cb(null, `${(req as Request<{ id: string }>).params.id}${ext}`);
  },
});

const coverUpload = multer({
  storage: coverStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG and PNG images are allowed'));
    }
  },
});

function isValidId(id: string): boolean {
  return /^[\w-]+$/.test(id);
}

// GET /api/playlists - List all playlists
router.get('/', (req: Request, res: Response) => {
  try {
    const playlists = getAllPlaylists();
    res.json(playlists);
  } catch (error) {
    console.error('Error fetching playlists:', error);
    res.status(500).json({ error: 'Failed to fetch playlists' });
  }
});

// POST /api/playlists - Create playlist
router.post('/', (req: Request, res: Response) => {
  try {
    const { name } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }

    if (getPlaylistCount() >= PLAYLIST_LIMIT) {
      return res.status(400).json({ error: `Maximum ${PLAYLIST_LIMIT} playlists allowed` });
    }

    const id = crypto.randomUUID();
    createPlaylist({ id, name: name.trim() });
    res.status(201).json({ success: true, id });
  } catch (error) {
    console.error('Error creating playlist:', error);
    res.status(500).json({ error: 'Failed to create playlist' });
  }
});

// GET /api/playlists/:id - Get playlist with songs
router.get('/:id', (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }

    const playlist = getPlaylistById(id);
    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    res.json(playlist);
  } catch (error) {
    console.error('Error fetching playlist:', error);
    res.status(500).json({ error: 'Failed to fetch playlist' });
  }
});

// PATCH /api/playlists/:id - Update playlist
router.patch('/:id', (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!isValidId(id)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }

    const existing = getPlaylistById(id);
    if (!existing) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    if (name !== undefined && (typeof name !== 'string' || !name.trim())) {
      return res.status(400).json({ error: 'Name must be a non-empty string' });
    }

    updatePlaylist(id, { name: name?.trim() });
    const updated = getPlaylistById(id);
    res.json({ success: true, playlist: updated });
  } catch (error) {
    console.error('Error updating playlist:', error);
    res.status(500).json({ error: 'Failed to update playlist' });
  }
});

// DELETE /api/playlists/:id - Delete playlist
router.delete('/:id', (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }

    const existing = getPlaylistById(id);
    if (!existing) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    deletePlaylist(id);
    res.json({ success: true, id });
  } catch (error) {
    console.error('Error deleting playlist:', error);
    res.status(500).json({ error: 'Failed to delete playlist' });
  }
});

// POST /api/playlists/:id/songs - Add songs to playlist
router.post('/:id/songs', (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;
    const { songIds } = req.body;

    if (!isValidId(id)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }

    if (!Array.isArray(songIds) || songIds.length === 0) {
      return res.status(400).json({ error: 'songIds must be a non-empty array' });
    }

    const existing = getPlaylistById(id);
    if (!existing) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    const currentCount = getPlaylistSongCount(id);
    if (currentCount >= PLAYLIST_SONGS_LIMIT) {
      return res.status(400).json({ error: `Maximum ${PLAYLIST_SONGS_LIMIT} songs per playlist` });
    }

    const entryIds = addSongsToPlaylist(id, songIds);
    res.status(201).json({ success: true, entryIds });
  } catch (error) {
    console.error('Error adding songs to playlist:', error);
    res.status(500).json({ error: 'Failed to add songs to playlist' });
  }
});

// DELETE /api/playlists/:id/songs/:entryId - Remove song entry
router.delete('/:id/songs/:entryId', (req: Request<{ id: string; entryId: string }>, res: Response) => {
  try {
    const { id, entryId } = req.params;

    if (!isValidId(id) || !isValidId(entryId)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }

    const existing = getPlaylistById(id);
    if (!existing) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    removeSongFromPlaylist(id, entryId);
    res.json({ success: true, entryId });
  } catch (error: any) {
    if (error?.message === 'Playlist entry not found') {
      return res.status(404).json({ error: 'Playlist entry not found' });
    }
    console.error('Error removing song from playlist:', error);
    res.status(500).json({ error: 'Failed to remove song from playlist' });
  }
});

// PATCH /api/playlists/:id/songs/reorder - Reorder songs
router.patch('/:id/songs/reorder', (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;
    const { entryIds } = req.body;

    if (!isValidId(id)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }

    if (!Array.isArray(entryIds)) {
      return res.status(400).json({ error: 'entryIds must be an array' });
    }

    const existing = getPlaylistById(id);
    if (!existing) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    const existingEntryIds = new Set(existing.songs.map(s => s.entryId));
    const providedEntryIds = new Set(entryIds);
    if (existingEntryIds.size !== providedEntryIds.size || 
        !existing.songs.every(s => providedEntryIds.has(s.entryId))) {
      return res.status(400).json({ error: 'entryIds do not match existing playlist entries' });
    }

    reorderPlaylistSongs(id, entryIds);
    res.json({ success: true });
  } catch (error) {
    console.error('Error reordering playlist songs:', error);
    res.status(500).json({ error: 'Failed to reorder playlist songs' });
  }
});

// POST /api/playlists/:id/cover - Upload playlist cover image
router.post('/:id/cover', (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  coverUpload.single('cover')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File too large (max 5 MB)' });
      }
      return res.status(400).json({ error: err.message });
    }
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    next();
  });
}, (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'Invalid ID format' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const existing = getPlaylistById(id);
    if (!existing) {
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ error: 'Playlist not found' });
    }

    // Remove any previous cover with the other extension
    const otherExt = req.file.mimetype === 'image/png' ? '.jpg' : '.png';
    const otherPath = path.join(playlistImagesDir, `${id}${otherExt}`);
    if (fs.existsSync(otherPath)) {
      fs.unlinkSync(otherPath);
    }

    const fileExt = req.file.mimetype === 'image/png' ? '.png' : '.jpg';
    const coverImageUrl = `/images/playlists/${id}${fileExt}`;

    updatePlaylist(id, { coverImageUrl });

    res.json({ coverImageUrl });
  } catch (error) {
    console.error('Error uploading playlist cover:', error);
    res.status(500).json({ error: 'Failed to upload playlist cover' });
  }
});

export default router;

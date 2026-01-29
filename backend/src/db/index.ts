import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import type { HistoryItem } from '../../../shared/types';

interface HistoryItemRow {
  id: string;
  prompt: string;
  title: string;
  lyrics: string;
  genre: string | null;
  created_at: string;
  feedback: string | null;
  suno_job_id: string | null;
  suno_clip_id: string | null;
  suno_status: string | null;
  suno_audio_url: string | null;
  suno_local_url: string | null;
  suno_image_url: string | null;
  variation_index: number | null;
  is_uploaded: number | null;
  duration: number | null;
}

const HISTORY_LIMIT = 10000;
const GENRE_LIMIT = 50;

// Ensure data directory exists
const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'sangtekst.db');
const db = new Database(dbPath);

// Enable WAL mode for better concurrent access
db.pragma('journal_mode = WAL');

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS history_items (
    id TEXT PRIMARY KEY,
    prompt TEXT NOT NULL,
    title TEXT NOT NULL,
    lyrics TEXT NOT NULL,
    genre TEXT,
    created_at TEXT NOT NULL,
    feedback TEXT,
    suno_job_id TEXT,
    suno_clip_id TEXT,
    suno_status TEXT,
    suno_audio_url TEXT,
    suno_local_url TEXT,
    suno_image_url TEXT,
    variation_index INTEGER,
    is_uploaded INTEGER DEFAULT 0,
    duration REAL
  );

  CREATE TABLE IF NOT EXISTS genre_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    genre TEXT UNIQUE NOT NULL,
    last_used_at TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_history_created_at ON history_items(created_at);
  CREATE INDEX IF NOT EXISTS idx_genre_last_used ON genre_history(last_used_at);
`);

// Migration: Add is_uploaded column to existing databases
const columns = db.prepare("PRAGMA table_info(history_items)").all() as { name: string }[];
const hasIsUploaded = columns.some(col => col.name === 'is_uploaded');
if (!hasIsUploaded) {
  db.exec('ALTER TABLE history_items ADD COLUMN is_uploaded INTEGER DEFAULT 0');
}
const hasDuration = columns.some(col => col.name === 'duration');
if (!hasDuration) {
  db.exec('ALTER TABLE history_items ADD COLUMN duration REAL');
}
const hasSunoImageUrl = columns.some(col => col.name === 'suno_image_url');
if (!hasSunoImageUrl) {
  db.exec('ALTER TABLE history_items ADD COLUMN suno_image_url TEXT');
}

// ============== Startup Cleanup ==============
// Delete jobs that were pending (not yet downloaded) when the app last shut down
db.exec(`
  DELETE FROM history_items
  WHERE suno_status = 'pending' AND suno_local_url IS NULL
`);

// Delete items that reference local files that no longer exist on disk
const mp3Dir = path.join(__dirname, '../../mp3s');
const itemsWithLocalFiles = db.prepare(
  `SELECT id, suno_local_url FROM history_items WHERE suno_local_url IS NOT NULL`
).all() as { id: string; suno_local_url: string }[];

for (const item of itemsWithLocalFiles) {
  const filename = item.suno_local_url.replace(/^\/mp3s\//, '');
  const filePath = path.join(mp3Dir, filename);
  if (!fs.existsSync(filePath)) {
    db.prepare('DELETE FROM history_items WHERE id = ?').run(item.id);
  }
}

// Delete mp3 files on disk that are not referenced by any database entry
if (fs.existsSync(mp3Dir)) {
  const referencedFiles = new Set(
    itemsWithLocalFiles.map(item => item.suno_local_url.replace(/^\/mp3s\//, ''))
  );
  const filesOnDisk = fs.readdirSync(mp3Dir).filter(f => f.endsWith('.mp3'));
  for (const file of filesOnDisk) {
    if (!referencedFiles.has(file)) {
      fs.unlinkSync(path.join(mp3Dir, file));
    }
  }
}

// ============== History Items ==============

const getAllHistoryStmt = db.prepare(`
  SELECT * FROM history_items ORDER BY created_at DESC
`);

const getHistoryByIdStmt = db.prepare(`
  SELECT * FROM history_items WHERE id = ?
`);

const insertHistoryStmt = db.prepare(`
  INSERT INTO history_items (
    id, prompt, title, lyrics, genre, created_at, feedback,
    suno_job_id, suno_clip_id, suno_status, suno_audio_url, suno_local_url, suno_image_url, variation_index, is_uploaded, duration
  ) VALUES (
    @id, @prompt, @title, @lyrics, @genre, @createdAt, @feedback,
    @sunoJobId, @sunoClipId, @sunoStatus, @sunoAudioUrl, @sunoLocalUrl, @sunoImageUrl, @variationIndex, @isUploaded, @duration
  )
`);

const updateHistoryStmt = db.prepare(`
  UPDATE history_items SET
    prompt = COALESCE(@prompt, prompt),
    title = COALESCE(@title, title),
    lyrics = COALESCE(@lyrics, lyrics),
    genre = COALESCE(@genre, genre),
    feedback = @feedback,
    suno_job_id = COALESCE(@sunoJobId, suno_job_id),
    suno_clip_id = COALESCE(@sunoClipId, suno_clip_id),
    suno_status = COALESCE(@sunoStatus, suno_status),
    suno_audio_url = COALESCE(@sunoAudioUrl, suno_audio_url),
    suno_local_url = COALESCE(@sunoLocalUrl, suno_local_url),
    suno_image_url = COALESCE(@sunoImageUrl, suno_image_url),
    variation_index = COALESCE(@variationIndex, variation_index),
    is_uploaded = COALESCE(@isUploaded, is_uploaded),
    duration = COALESCE(@duration, duration)
  WHERE id = @id
`);

const deleteHistoryStmt = db.prepare(`
  DELETE FROM history_items WHERE id = ?
`);

const countHistoryStmt = db.prepare(`
  SELECT COUNT(*) as count FROM history_items
`);

const deleteOldestHistoryStmt = db.prepare(`
  DELETE FROM history_items WHERE id IN (
    SELECT id FROM history_items ORDER BY created_at ASC LIMIT ?
  )
`);

function rowToHistoryItem(row: HistoryItemRow): HistoryItem {
  return {
    id: row.id,
    prompt: row.prompt,
    title: row.title,
    lyrics: row.lyrics,
    genre: row.genre ?? undefined,
    createdAt: row.created_at,
    feedback: row.feedback as 'up' | 'down' | undefined,
    sunoJobId: row.suno_job_id ?? undefined,
    sunoClipId: row.suno_clip_id ?? undefined,
    sunoStatus: row.suno_status as 'pending' | 'completed' | 'failed' | undefined,
    sunoAudioUrl: row.suno_audio_url ?? undefined,
    sunoLocalUrl: row.suno_local_url ?? undefined,
    sunoImageUrl: row.suno_image_url ?? undefined,
    variationIndex: row.variation_index ?? undefined,
    isUploaded: row.is_uploaded === 1 ? true : undefined,
    duration: row.duration ?? undefined,
  };
}

export function getAllHistoryItems(): HistoryItem[] {
  const rows = getAllHistoryStmt.all() as HistoryItemRow[];
  return rows.map(rowToHistoryItem);
}

export function getHistoryItemById(id: string): HistoryItem | null {
  const row = getHistoryByIdStmt.get(id) as HistoryItemRow | undefined;
  return row ? rowToHistoryItem(row) : null;
}

export function createHistoryItem(item: HistoryItem): void {
  insertHistoryStmt.run({
    id: item.id,
    prompt: item.prompt,
    title: item.title,
    lyrics: item.lyrics,
    genre: item.genre ?? null,
    createdAt: item.createdAt,
    feedback: item.feedback ?? null,
    sunoJobId: item.sunoJobId ?? null,
    sunoClipId: item.sunoClipId ?? null,
    sunoStatus: item.sunoStatus ?? null,
    sunoAudioUrl: item.sunoAudioUrl ?? null,
    sunoLocalUrl: item.sunoLocalUrl ?? null,
    sunoImageUrl: item.sunoImageUrl ?? null,
    variationIndex: item.variationIndex ?? null,
    isUploaded: item.isUploaded ? 1 : 0,
    duration: item.duration ?? null,
  });
  enforceHistoryLimit();
}

export function updateHistoryItem(id: string, updates: Partial<HistoryItem>): void {
  updateHistoryStmt.run({
    id,
    prompt: updates.prompt ?? null,
    title: updates.title ?? null,
    lyrics: updates.lyrics ?? null,
    genre: updates.genre ?? null,
    feedback: updates.feedback ?? null,
    sunoJobId: updates.sunoJobId ?? null,
    sunoClipId: updates.sunoClipId ?? null,
    sunoStatus: updates.sunoStatus ?? null,
    sunoAudioUrl: updates.sunoAudioUrl ?? null,
    sunoLocalUrl: updates.sunoLocalUrl ?? null,
    sunoImageUrl: updates.sunoImageUrl ?? null,
    variationIndex: updates.variationIndex ?? null,
    isUploaded: updates.isUploaded !== undefined ? (updates.isUploaded ? 1 : 0) : null,
    duration: updates.duration ?? null,
  });
}

export function deleteHistoryItem(id: string): void {
  deleteHistoryStmt.run(id);
}

function enforceLimit(
  countStmt: Database.Statement,
  deleteStmt: Database.Statement,
  limit: number
): void {
  const { count } = countStmt.get() as { count: number };
  if (count > limit) {
    const excess = count - limit;
    deleteStmt.run(excess);
  }
}

function enforceHistoryLimit(): void {
  enforceLimit(countHistoryStmt, deleteOldestHistoryStmt, HISTORY_LIMIT);
}

// ============== Genre History ==============

const getAllGenresStmt = db.prepare(`
  SELECT genre FROM genre_history ORDER BY last_used_at DESC
`);

const upsertGenreStmt = db.prepare(`
  INSERT INTO genre_history (genre, last_used_at)
  VALUES (?, ?)
  ON CONFLICT(genre) DO UPDATE SET last_used_at = excluded.last_used_at
`);

const deleteGenreStmt = db.prepare(`
  DELETE FROM genre_history WHERE genre = ?
`);

const countGenresStmt = db.prepare(`
  SELECT COUNT(*) as count FROM genre_history
`);

const deleteOldestGenresStmt = db.prepare(`
  DELETE FROM genre_history WHERE id IN (
    SELECT id FROM genre_history ORDER BY last_used_at ASC LIMIT ?
  )
`);

export function getAllGenres(): string[] {
  const rows = getAllGenresStmt.all() as { genre: string }[];
  return rows.map(row => row.genre);
}

export function addGenre(genre: string): void {
  const now = new Date().toISOString();
  upsertGenreStmt.run(genre, now);
  enforceGenreLimit();
}

export function removeGenre(genre: string): void {
  deleteGenreStmt.run(genre);
}

function enforceGenreLimit(): void {
  enforceLimit(countGenresStmt, deleteOldestGenresStmt, GENRE_LIMIT);
}

// ============== Database Management ==============

export function closeDatabase(): void {
  db.close();
}

export { db };

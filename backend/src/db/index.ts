import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import type { HistoryItem } from '../../../shared/types';

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
    variation_index INTEGER
  );

  CREATE TABLE IF NOT EXISTS genre_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    genre TEXT UNIQUE NOT NULL,
    last_used_at TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_history_created_at ON history_items(created_at);
  CREATE INDEX IF NOT EXISTS idx_genre_last_used ON genre_history(last_used_at);
`);

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
    suno_job_id, suno_clip_id, suno_status, suno_audio_url, suno_local_url, variation_index
  ) VALUES (
    @id, @prompt, @title, @lyrics, @genre, @createdAt, @feedback,
    @sunoJobId, @sunoClipId, @sunoStatus, @sunoAudioUrl, @sunoLocalUrl, @variationIndex
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
    variation_index = COALESCE(@variationIndex, variation_index)
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

function rowToHistoryItem(row: Record<string, unknown>): HistoryItem {
  return {
    id: row.id as string,
    prompt: row.prompt as string,
    title: row.title as string,
    lyrics: row.lyrics as string,
    genre: row.genre as string | undefined,
    createdAt: row.created_at as string,
    feedback: row.feedback as 'up' | 'down' | undefined,
    sunoJobId: row.suno_job_id as string | undefined,
    sunoClipId: row.suno_clip_id as string | undefined,
    sunoStatus: row.suno_status as 'pending' | 'completed' | 'failed' | undefined,
    sunoAudioUrl: row.suno_audio_url as string | undefined,
    sunoLocalUrl: row.suno_local_url as string | undefined,
    variationIndex: row.variation_index as number | undefined,
  };
}

export function getAllHistoryItems(): HistoryItem[] {
  const rows = getAllHistoryStmt.all() as Record<string, unknown>[];
  return rows.map(rowToHistoryItem);
}

export function getHistoryItemById(id: string): HistoryItem | null {
  const row = getHistoryByIdStmt.get(id) as Record<string, unknown> | undefined;
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
    variationIndex: item.variationIndex ?? null,
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
    variationIndex: updates.variationIndex ?? null,
  });
}

export function deleteHistoryItem(id: string): void {
  deleteHistoryStmt.run(id);
}

function enforceHistoryLimit(): void {
  const { count } = countHistoryStmt.get() as { count: number };
  if (count > HISTORY_LIMIT) {
    const excess = count - HISTORY_LIMIT;
    deleteOldestHistoryStmt.run(excess);
  }
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
  const { count } = countGenresStmt.get() as { count: number };
  if (count > GENRE_LIMIT) {
    const excess = count - GENRE_LIMIT;
    deleteOldestGenresStmt.run(excess);
  }
}

// ============== Database Management ==============

export function closeDatabase(): void {
  db.close();
}

export { db };

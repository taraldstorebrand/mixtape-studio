import { Router, Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { spawn } from 'child_process';
import ffmpegPath from 'ffmpeg-static';
import { getAllHistoryItems, getPlaylistById } from '../db';
import { broadcastSseEvent } from '../services/sse';
import { getAudioDurationMs } from '../utils/ffmpeg';

const router = Router();

const TEMP_DIR = path.join(__dirname, '../../temp');
const PLACEHOLDER_IMAGE = path.join(__dirname, '../assets/placeholder.png');
const TEMP_TTL_MS = 10 * 60 * 1000; // 10 minutes

interface MixtapeTask {
  status: 'pending' | 'ready' | 'failed';
  downloadId?: string;
  fileName?: string;
  error?: string;
  updatedAt: number;
}

// Task state for polling. Phones drop the SSE connection while the screen is
// off, so a 'mixtape-ready' event sent at that moment is lost; clients poll
// GET /status/:taskId as a fallback.
const tasks = new Map<string, MixtapeTask>();

function newTaskId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Records the result and notifies connected clients. */
function finishTask(taskId: string, result: { downloadId?: string; fileName?: string; error?: string }) {
  tasks.set(taskId, { status: result.error ? 'failed' : 'ready', ...result, updatedAt: Date.now() });
  broadcastSseEvent('mixtape-ready', { taskId, ...result });
}

function ensureTempDir(): void {
  if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
  }
}

export function cleanupOldTempFiles(): void {
  ensureTempDir();
  const now = Date.now();
  for (const [taskId, task] of tasks) {
    if (task.status !== 'pending' && now - task.updatedAt > TEMP_TTL_MS) {
      tasks.delete(taskId);
    }
  }
  try {
    const files = fs.readdirSync(TEMP_DIR);
    for (const file of files) {
      const filePath = path.join(TEMP_DIR, file);
      const stat = fs.statSync(filePath);
      if (now - stat.mtimeMs > TEMP_TTL_MS) {
        fs.unlinkSync(filePath);
        console.log(`Cleaned up old temp file: ${file}`);
      }
    }
  } catch (err) {
    console.error('Error cleaning up temp files:', err);
  }
}



async function generateChapterMetadata(
  items: { title: string; filePath: string }[]
): Promise<string> {
  const lines = [';FFMETADATA1'];
  let currentTimeMs = 0;

  for (const item of items) {
    const durationMs = await getAudioDurationMs(item.filePath);
    const startMs = currentTimeMs;
    const endMs = currentTimeMs + durationMs;

    lines.push('');
    lines.push('[CHAPTER]');
    lines.push('TIMEBASE=1/1000');
    lines.push(`START=${startMs}`);
    lines.push(`END=${endMs}`);
    lines.push(`title=${item.title.replace(/[=;\n\\]/g, ' ')}`);

    currentTimeMs = endMs;
  }

  return lines.join('\n');
}

function cleanupTempFiles(...filePaths: string[]): void {
  for (const filePath of filePaths) {
    try {
      fs.unlinkSync(filePath);
    } catch {
      // Ignore cleanup errors
    }
  }
}

interface FfmpegConcatOptions {
  tempListFile: string;
  tempMetadataFile: string;
  outputFile: string;
  mixtapeName: string;
  hasImage: boolean;
  imagePath?: string;
}

function runFfmpegConcat(options: FfmpegConcatOptions): Promise<void> {
  const { tempListFile, tempMetadataFile, outputFile, mixtapeName, hasImage, imagePath } = options;

  return new Promise((resolve, reject) => {
    const ffmpegArgs = [
      '-f', 'concat',
      '-safe', '0',
      '-i', tempListFile,
      '-i', tempMetadataFile,
    ];

    if (hasImage && imagePath) {
      ffmpegArgs.push('-i', imagePath);
    }

    ffmpegArgs.push(
      '-map_metadata', '1',
      '-c:a', 'aac',
      '-b:a', '256k',
      '-metadata', `title=${mixtapeName}`,
      '-metadata', 'album=Suno and others Mixtape',
      '-metadata', 'artist=Tarald',
    );

    if (hasImage) {
      ffmpegArgs.push('-map', '0:a', '-map', '2:v');
      ffmpegArgs.push('-c:v', 'mjpeg', '-q:v', '2');
      ffmpegArgs.push('-disposition:v:0', 'attached_pic');
    }

    ffmpegArgs.push(outputFile);

    const ffmpeg = spawn(ffmpegPath!, ffmpegArgs);

    let stderrOutput = '';
    ffmpeg.stderr?.on('data', (data: Buffer) => {
      stderrOutput += data.toString();
    });

    ffmpeg.on('close', (code) => {
      if (code !== 0) {
        console.error('ffmpeg stderr:', stderrOutput);
      }
      cleanupTempFiles(tempListFile, tempMetadataFile);
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`ffmpeg exited with code ${code}`));
      }
    });

    ffmpeg.on('error', (err) => {
      cleanupTempFiles(tempListFile, tempMetadataFile);
      reject(err);
    });
  });
}

interface MixtapeOptions {
  taskId: string;
  songIds?: string[];
  name?: string;
  coverImageUrl?: string;
}

async function generateMixtape(options: MixtapeOptions): Promise<void> {
  const { taskId, songIds, name, coverImageUrl } = options;
  const mp3sDir = path.join(__dirname, '../../mp3s');
  ensureTempDir();
  tasks.set(taskId, { status: 'pending', updatedAt: Date.now() });

  try {
    const allItems = getAllHistoryItems();

    let selectedItems;
    if (songIds && songIds.length > 0) {
      // Custom mixtape: use provided song IDs in order (can include duplicates)
      selectedItems = songIds
        .map((id) => allItems.find((item) => item.id === id))
        .filter((item) => item && item.sunoLocalUrl);
    } else {
      // Legacy: use liked songs sorted by creation date
      selectedItems = allItems
        .filter((item) => item.feedback === 'up' && item.sunoLocalUrl)
        .sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
    }

    if (selectedItems.length === 0) {
      finishTask(taskId, { error: 'No songs found' });
      return;
    }

    const downloadId = `${taskId}_${Date.now()}`;
    const tempListFile = path.join(TEMP_DIR, `concat_${downloadId}.txt`);
    const tempMetadataFile = path.join(TEMP_DIR, `metadata_${downloadId}.txt`);
    const outputFile = path.join(TEMP_DIR, `${downloadId}.m4b`);

    const mixtapeName = name || 'Mixtape';
    const fileName = `${mixtapeName.replace(/[^a-zA-Z0-9æøåÆØÅ\s-]/g, '_')}.m4b`;

    const songData = selectedItems.map((item) => {
      const filename = item!.sunoLocalUrl!.replace(/^\/mp3s\//, '');
      const filePath = path.join(mp3sDir, filename);
      return { title: item!.title, filePath };
    });

    const fileListContent = songData
      .map((song) => `file '${song.filePath.replace(/'/g, "'\\''")}'`)
      .join('\n');

    fs.writeFileSync(tempListFile, fileListContent);

    const metadataContent = await generateChapterMetadata(songData);
    fs.writeFileSync(tempMetadataFile, metadataContent);

    let resolvedImagePath: string | undefined;
    if (coverImageUrl) {
      const relativePath = coverImageUrl.replace(/^\//, '');
      const absolutePath = path.join(__dirname, '../../', relativePath);
      if (fs.existsSync(absolutePath)) {
        resolvedImagePath = absolutePath;
      }
    }
    if (!resolvedImagePath && fs.existsSync(PLACEHOLDER_IMAGE)) {
      resolvedImagePath = PLACEHOLDER_IMAGE;
    }

    await runFfmpegConcat({
      tempListFile,
      tempMetadataFile,
      outputFile,
      mixtapeName,
      hasImage: !!resolvedImagePath,
      imagePath: resolvedImagePath,
    });

    finishTask(taskId, { downloadId, fileName });
  } catch (error: any) {
    console.error('Error creating mixtape:', error);
    finishTask(taskId, { error: 'Failed to create mixtape' });
  }
}

// POST /api/mixtape/liked - Start mixtape generation (legacy)
router.post('/liked', async (req: Request, res: Response) => {
  const items = getAllHistoryItems();
  const likedCount = items.filter(
    (item) => item.feedback === 'up' && item.sunoLocalUrl
  ).length;

  if (likedCount === 0) {
    return res.status(400).json({ error: 'No liked songs found' });
  }

  const taskId = newTaskId();

  generateMixtape({ taskId });

  res.json({ taskId });
});

// POST /api/mixtape/playlist/:playlistId - Create mixtape from playlist
router.post('/playlist/:playlistId', async (req: Request, res: Response) => {
  const playlistId = req.params.playlistId as string;

  const playlist = getPlaylistById(playlistId);
  if (!playlist) {
    return res.status(404).json({ error: 'Playlist not found' });
  }

  const songIds = playlist.songs
    .filter(entry => entry.song.sunoLocalUrl)
    .map(entry => entry.song.id);

  if (songIds.length === 0) {
    return res.status(400).json({ error: 'No songs in playlist with audio files' });
  }

  const taskId = newTaskId();

  generateMixtape({ taskId, songIds, name: playlist.name, coverImageUrl: playlist.coverImageUrl });

  res.json({ taskId });
});

// GET /api/mixtape/status/:taskId - Poll generation status (fallback for missed SSE events)
router.get('/status/:taskId', (req: Request, res: Response) => {
  const task = tasks.get(req.params.taskId as string);
  if (!task) {
    return res.status(404).json({ error: 'Unknown or expired mixtape task' });
  }
  const { updatedAt: _updatedAt, ...status } = task;
  res.json(status);
});

// GET /api/mixtape/download/:downloadId - Download generated mixtape.
// The file is kept until the temp TTL expires rather than deleted on first
// download: mobile browsers (iOS Safari) may request it more than once.
router.get('/download/:downloadId', (req: Request, res: Response) => {
  const downloadId = req.params.downloadId as string;
  const fileName = req.query.fileName as string | undefined;

  // Validate downloadId to prevent path traversal
  if (!/^[\w-]+$/.test(downloadId)) {
    return res.status(400).json({ error: 'Invalid download ID' });
  }

  const filePath = path.join(TEMP_DIR, `${downloadId}.m4b`);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found or expired' });
  }

  const downloadFileName = fileName || 'mixtape_liked_songs.m4b';

  // res.download sets Content-Disposition with an ASCII fallback and a UTF-8 filename
  res.download(filePath, downloadFileName, { headers: { 'Content-Type': 'audio/mp4' } });
});

export default router;

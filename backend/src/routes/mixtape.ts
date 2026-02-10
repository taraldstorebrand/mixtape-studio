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

function ensureTempDir(): void {
  if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
  }
}

export function cleanupOldTempFiles(): void {
  ensureTempDir();
  const now = Date.now();
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
}

async function generateMixtape(options: MixtapeOptions): Promise<void> {
  const { taskId, songIds, name } = options;
  const mp3sDir = path.join(__dirname, '../../mp3s');
  ensureTempDir();

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
      broadcastSseEvent('mixtape-ready', { taskId, error: 'No songs found' });
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

    const hasImage = fs.existsSync(PLACEHOLDER_IMAGE);
    await runFfmpegConcat({
      tempListFile,
      tempMetadataFile,
      outputFile,
      mixtapeName,
      hasImage,
      imagePath: hasImage ? PLACEHOLDER_IMAGE : undefined,
    });

    broadcastSseEvent('mixtape-ready', { taskId, downloadId, fileName });
  } catch (error: any) {
    console.error('Error creating mixtape:', error);
    broadcastSseEvent('mixtape-ready', { taskId, error: 'Failed to create mixtape' });
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

  const taskId = Date.now().toString();

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

  const taskId = Date.now().toString();

  generateMixtape({ taskId, songIds, name: playlist.name });

  res.json({ taskId });
});

// GET /api/mixtape/download/:downloadId - Download generated mixtape
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

  res.setHeader('Content-Type', 'audio/mp4');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="${encodeURIComponent(downloadFileName)}"`
  );

  const stream = fs.createReadStream(filePath);

  stream.on('end', () => {
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error('Error deleting temp file after download:', err);
      } else {
        console.log(`Deleted temp file after download: ${downloadId}.m4b`);
      }
    });
  });

  stream.on('error', (err) => {
    console.error('Error streaming mixtape file:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to download file' });
    }
  });

  stream.pipe(res);
});

export default router;

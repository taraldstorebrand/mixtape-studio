import { Router, Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { spawn, spawnSync } from 'child_process';
import ffmpegPath from 'ffmpeg-static';
import { getAllHistoryItems } from '../db';
import { io } from '../server';

const router = Router();

const TEMP_DIR = path.join(__dirname, '../../temp');
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

function getAudioDurationMs(filePath: string): number {
  const result = spawnSync(ffmpegPath!, ['-i', filePath, '-hide_banner'], {
    encoding: 'utf-8',
  });

  const output = result.stderr || result.stdout || '';
  const match = output.match(/Duration: (\d+):(\d+):(\d+)\.(\d+)/);
  if (match) {
    const hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const seconds = parseInt(match[3], 10);
    const centiseconds = parseInt(match[4], 10);
    return (hours * 3600 + minutes * 60 + seconds) * 1000 + centiseconds * 10;
  }
  return 0;
}

function generateChapterMetadata(
  items: { title: string; filePath: string }[]
): string {
  let lines = [';FFMETADATA1'];
  let currentTimeMs = 0;

  for (const item of items) {
    const durationMs = getAudioDurationMs(item.filePath);
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

async function generateMixtape(taskId: string): Promise<void> {
  const mp3sDir = path.join(__dirname, '../../mp3s');
  ensureTempDir();

  try {
    const items = getAllHistoryItems();
    const likedItems = items
      .filter((item) => item.feedback === 'up' && item.sunoLocalUrl)
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

    if (likedItems.length === 0) {
      io.emit('mixtape-ready', { taskId, error: 'Ingen likte sanger funnet' });
      return;
    }

    const downloadId = `${taskId}_${Date.now()}`;
    const tempListFile = path.join(TEMP_DIR, `concat_${downloadId}.txt`);
    const tempMetadataFile = path.join(TEMP_DIR, `metadata_${downloadId}.txt`);
    const outputFile = path.join(TEMP_DIR, `${downloadId}.m4b`);

    const songData = likedItems.map((item) => {
      const filename = item.sunoLocalUrl!.replace(/^\/mp3s\//, '');
      const filePath = path.join(mp3sDir, filename);
      return { title: item.title, filePath };
    });

    const fileListContent = songData
      .map((song) => `file '${song.filePath.replace(/'/g, "'\\''")}'`)
      .join('\n');

    fs.writeFileSync(tempListFile, fileListContent);

    const metadataContent = generateChapterMetadata(songData);
    fs.writeFileSync(tempMetadataFile, metadataContent);

    await new Promise<void>((resolve, reject) => {
      const ffmpeg = spawn(ffmpegPath!, [
        '-f',
        'concat',
        '-safe',
        '0',
        '-i',
        tempListFile,
        '-i',
        tempMetadataFile,
        '-map_metadata',
        '1',
        '-c:a',
        'aac',
        '-b:a',
        '256k',
        '-metadata',
        'title=Liked Songs – Mixtape',
        '-metadata',
        'album=Suno and others Mixtape',
        '-metadata',
        'artist=Tarald',
        outputFile,
      ]);

      ffmpeg.on('close', (code) => {
        try {
          fs.unlinkSync(tempListFile);
          fs.unlinkSync(tempMetadataFile);
        } catch {}
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`ffmpeg exited with code ${code}`));
        }
      });

      ffmpeg.on('error', (err) => {
        try {
          fs.unlinkSync(tempListFile);
          fs.unlinkSync(tempMetadataFile);
        } catch {}
        reject(err);
      });
    });

    io.emit('mixtape-ready', { taskId, downloadId });
  } catch (error: any) {
    console.error('Error creating mixtape:', error);
    io.emit('mixtape-ready', { taskId, error: 'Kunne ikke lage mixtape' });
  }
}

// POST /api/mixtape/liked - Start mixtape generation
router.post('/liked', async (req: Request, res: Response) => {
  const items = getAllHistoryItems();
  const likedCount = items.filter(
    (item) => item.feedback === 'up' && item.sunoLocalUrl
  ).length;

  if (likedCount === 0) {
    return res.status(400).json({ error: 'Ingen likte sanger funnet' });
  }

  const taskId = Date.now().toString();

  generateMixtape(taskId);

  res.json({ taskId });
});

// GET /api/mixtape/download/:downloadId - Download generated mixtape
router.get('/download/:downloadId', (req: Request, res: Response) => {
  const { downloadId } = req.params;
  const filePath = path.join(TEMP_DIR, `${downloadId}.m4b`);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Fil ikke funnet eller utløpt' });
  }

  res.setHeader('Content-Type', 'audio/mp4');
  res.setHeader(
    'Content-Disposition',
    'attachment; filename="mixtape_likte_sanger.m4b"'
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
      res.status(500).json({ error: 'Kunne ikke laste ned fil' });
    }
  });

  stream.pipe(res);
});

export default router;

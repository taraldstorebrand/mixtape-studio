import { Router, Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { spawn, spawnSync } from 'child_process';
import ffmpegPath from 'ffmpeg-static';
import { getAllHistoryItems } from '../db';
import { io } from '../server';

const router = Router();

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

    const timestamp = Date.now();
    const tempListFile = path.join(mp3sDir, `concat_${timestamp}.txt`);
    const tempMetadataFile = path.join(mp3sDir, `metadata_${timestamp}.txt`);

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

    const outputFilename = `mixtape_${taskId}.m4b`;
    const outputFile = path.join(mp3sDir, outputFilename);

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
        '192k',
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

    io.emit('mixtape-ready', {
      taskId,
      downloadUrl: `/mp3s/${outputFilename}`,
    });
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

export default router;

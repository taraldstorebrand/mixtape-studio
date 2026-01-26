import { Router, Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { spawn } from 'child_process';
import ffmpegPath from 'ffmpeg-static';
import { getAllHistoryItems } from '../db';

const router = Router();

// POST /api/mixtape/liked - Create mixtape from liked songs
router.post('/liked', async (req: Request, res: Response) => {
  try {
    const items = getAllHistoryItems();
    const likedItems = items
      .filter((item) => item.feedback === 'up' && item.sunoLocalUrl)
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

    if (likedItems.length === 0) {
      return res.status(400).json({ error: 'Ingen likte sanger funnet' });
    }

    const mp3sDir = path.join(__dirname, '../../mp3s');
    const tempListFile = path.join(mp3sDir, `concat_${Date.now()}.txt`);

    const fileListContent = likedItems
      .map((item) => {
        const filename = item.sunoLocalUrl!.replace(/^\/mp3s\//, '');
        const filePath = path.join(mp3sDir, filename);
        return `file '${filePath.replace(/'/g, "'\\''")}'`;
      })
      .join('\n');

    fs.writeFileSync(tempListFile, fileListContent);

    const outputFile = path.join(mp3sDir, `mixtape_${Date.now()}.mp3`);

    await new Promise<void>((resolve, reject) => {
      const ffmpeg = spawn(ffmpegPath!, [
        '-f',
        'concat',
        '-safe',
        '0',
        '-i',
        tempListFile,
        '-c',
        'copy',
        outputFile,
      ]);

      ffmpeg.on('close', (code) => {
        fs.unlinkSync(tempListFile);
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`ffmpeg exited with code ${code}`));
        }
      });

      ffmpeg.on('error', (err) => {
        fs.unlinkSync(tempListFile);
        reject(err);
      });
    });

    const stat = fs.statSync(outputFile);
    res.setHeader('Content-Length', stat.size);
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="mixtape_likte_sanger.mp3"'
    );

    const stream = fs.createReadStream(outputFile);
    stream.pipe(res);

    stream.on('end', () => {
      fs.unlinkSync(outputFile);
    });
  } catch (error: any) {
    console.error('Error creating mixtape:', error);
    res.status(500).json({ error: 'Kunne ikke lage mixtape' });
  }
});

export default router;

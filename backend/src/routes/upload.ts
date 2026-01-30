import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { createHistoryItem } from '../db';
import type { HistoryItem } from '../../../shared/types';
import * as musicMetadata from 'music-metadata';
import { getMp3DurationSync } from '../utils/ffmpeg';

const imagesDir = path.join(__dirname, '../../images');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

const PLACEHOLDER_IMAGE_URL = '/assets/placeholder.png';

interface ExtractedMetadata {
  imageUrl: string;
  artist?: string;
  album?: string;
  genre?: string;
}

async function extractMetadata(filePath: string, baseFilename: string): Promise<ExtractedMetadata> {
  const result: ExtractedMetadata = {
    imageUrl: PLACEHOLDER_IMAGE_URL,
  };

  try {
    const metadata = await musicMetadata.parseFile(filePath);

    // Extract cover art
    const picture = metadata.common.picture?.[0];
    if (picture) {
      const ext = picture.format === 'image/png' ? '.png' : '.jpg';
      const imageFilename = `${baseFilename}${ext}`;
      const imagePath = path.join(imagesDir, imageFilename);
      fs.writeFileSync(imagePath, picture.data);
      result.imageUrl = `/images/${imageFilename}`;
    }

    // Extract artist, album, and genre
    if (metadata.common.artist) {
      result.artist = metadata.common.artist;
    }
    if (metadata.common.album) {
      result.album = metadata.common.album;
    }
    if (metadata.common.genre && metadata.common.genre.length > 0) {
      result.genre = metadata.common.genre[0];
    }
  } catch (err) {
    console.error('Could not extract metadata:', err);
  }

  return result;
}



const router = Router();

const mp3Dir = path.join(__dirname, '../../mp3s');
if (!fs.existsSync(mp3Dir)) {
  fs.mkdirSync(mp3Dir, { recursive: true });
}

function sanitizeFilename(title: string): string {
  return title.replace(/[^a-zA-Z0-9æøåÆØÅ\-_\s]/g, '_').trim();
}

function getUniqueFilename(baseFilename: string): string {
  const ext = '.mp3';
  let filename = `${baseFilename}${ext}`;
  let filePath = path.join(mp3Dir, filename);
  let counter = 1;

  while (fs.existsSync(filePath)) {
    filename = `${baseFilename}_${counter}${ext}`;
    filePath = path.join(mp3Dir, filename);
    counter++;
  }

  return filename;
}

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 10,
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'audio/mpeg' || file.mimetype === 'audio/mp3') {
      cb(null, true);
    } else {
      cb(new Error('Only MP3 files allowed'));
    }
  },
});

router.post('/', upload.array('files', 10), async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];
    
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    if (files.length > 10) {
      return res.status(400).json({ error: 'Maximum 10 files per upload' });
    }

    let titles: string[];
    try {
      titles = JSON.parse(req.body.titles || '[]');
    } catch {
      return res.status(400).json({ error: 'Invalid title format' });
    }

    if (titles.length !== files.length) {
      return res.status(400).json({ error: 'Title count must match file count' });
    }

    const items: { id: string; localUrl: string; duration?: number; imageUrl: string }[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const title = titles[i]?.trim();

      if (!title) {
        return res.status(400).json({ error: `Title missing for file ${i + 1}` });
      }

      const sanitized = sanitizeFilename(title);
      const filename = getUniqueFilename(sanitized);
      const filePath = path.join(mp3Dir, filename);

      fs.writeFileSync(filePath, file.buffer);

      const duration = getMp3DurationSync(filePath);
      const metadata = await extractMetadata(filePath, sanitized);
      const id = `upload-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const localUrl = `/mp3s/${filename}`;

      const historyItem: HistoryItem = {
        id,
        prompt: '',
        title,
        lyrics: '',
        createdAt: new Date().toISOString(),
        sunoLocalUrl: localUrl,
        sunoImageUrl: metadata.imageUrl,
        artist: metadata.artist,
        album: metadata.album,
        genre: metadata.genre,
        isUploaded: true,
        duration,
      };

      createHistoryItem(historyItem);
      items.push({ id, localUrl, duration, imageUrl: metadata.imageUrl });
    }

    res.status(201).json({ success: true, items });
  } catch (error: any) {
    console.error('Error uploading files:', error);
    res.status(500).json({ error: 'Failed to upload files' });
  }
});

export default router;

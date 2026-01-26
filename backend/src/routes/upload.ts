import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { createHistoryItem } from '../db';
import type { HistoryItem } from '../../../shared/types';

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
      cb(new Error('Kun MP3-filer er tillatt'));
    }
  },
});

router.post('/', upload.array('files', 10), (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];
    
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'Ingen filer lastet opp' });
    }

    if (files.length > 10) {
      return res.status(400).json({ error: 'Maksimalt 10 filer per opplasting' });
    }

    let titles: string[];
    try {
      titles = JSON.parse(req.body.titles || '[]');
    } catch {
      return res.status(400).json({ error: 'Ugyldig tittel-format' });
    }

    if (titles.length !== files.length) {
      return res.status(400).json({ error: 'Antall titler må matche antall filer' });
    }

    const items: { id: string; localUrl: string }[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const title = titles[i]?.trim();

      if (!title) {
        return res.status(400).json({ error: `Tittel mangler for fil ${i + 1}` });
      }

      const sanitized = sanitizeFilename(title);
      const filename = getUniqueFilename(sanitized);
      const filePath = path.join(mp3Dir, filename);

      fs.writeFileSync(filePath, file.buffer);

      const id = `upload-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const localUrl = `/mp3s/${filename}`;

      const historyItem: HistoryItem = {
        id,
        prompt: '',
        title,
        lyrics: '',
        createdAt: new Date().toISOString(),
        sunoLocalUrl: localUrl,
        isUploaded: true,
      };

      createHistoryItem(historyItem);
      items.push({ id, localUrl });
    }

    res.status(201).json({ success: true, items });
  } catch (error: any) {
    console.error('Error uploading files:', error);
    res.status(500).json({ error: 'Kunne ikke laste opp filer' });
  }
});

export default router;

import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { createHistoryItem } from '../db';
import type { HistoryItem } from '../../../shared/types';

const router = Router();

// Ensure mp3s directory exists
const mp3Dir = path.join(__dirname, '../../mp3s');
if (!fs.existsSync(mp3Dir)) {
  fs.mkdirSync(mp3Dir, { recursive: true });
}

// Configure multer for MP3 uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, mp3Dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    cb(null, `upload-${uniqueSuffix}.mp3`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'audio/mpeg' || file.mimetype === 'audio/mp3') {
      cb(null, true);
    } else {
      cb(new Error('Kun MP3-filer er tillatt'));
    }
  },
});

// POST /api/upload - Upload MP3 file and create history item
router.post('/', upload.single('file'), (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Ingen fil lastet opp' });
    }

    const { title } = req.body;
    if (!title || typeof title !== 'string' || title.trim() === '') {
      // Delete uploaded file if title is missing
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'Tittel er påkrevd' });
    }

    const id = `upload-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const localUrl = `/mp3s/${req.file.filename}`;

    const historyItem: HistoryItem = {
      id,
      prompt: '',
      title: title.trim(),
      lyrics: '',
      createdAt: new Date().toISOString(),
      sunoLocalUrl: localUrl,
      isUploaded: true,
    };

    createHistoryItem(historyItem);

    res.status(201).json({
      success: true,
      id,
      localUrl,
    });
  } catch (error: any) {
    console.error('Error uploading file:', error);
    // Clean up file if it was uploaded
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: 'Kunne ikke laste opp fil' });
  }
});

export default router;

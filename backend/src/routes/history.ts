import { Router, Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import {
  getAllHistoryItems,
  getHistoryItemById,
  createHistoryItem,
  updateHistoryItem,
  deleteHistoryItem,
} from '../db';
import type { HistoryItem } from '../../../shared/types';

const router = Router();

// GET /api/history - Fetch all history items
router.get('/', (req: Request, res: Response) => {
  try {
    const items = getAllHistoryItems();
    res.json(items);
  } catch (error: any) {
    console.error('Error fetching history:', error);
    res.status(500).json({ error: 'Kunne ikke hente historikk' });
  }
});

// POST /api/history - Create new history item
router.post('/', (req: Request, res: Response) => {
  try {
    const item: HistoryItem = req.body;

    if (!item.id || !item.prompt || !item.title || !item.lyrics || !item.createdAt) {
      return res.status(400).json({
        error: 'Mangler påkrevde felt: id, prompt, title, lyrics, createdAt',
      });
    }

    createHistoryItem(item);
    res.status(201).json({ success: true, id: item.id });
  } catch (error: any) {
    console.error('Error creating history item:', error);
    res.status(500).json({ error: 'Kunne ikke opprette historikk-element' });
  }
});

// PATCH /api/history/:id - Update history item
router.patch('/:id', (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;
    const updates: Partial<HistoryItem> = req.body;

    // Check if item exists
    const existing = getHistoryItemById(id);
    if (!existing) {
      return res.status(404).json({ error: 'Historikk-element ikke funnet' });
    }

    updateHistoryItem(id, updates);
    res.json({ success: true, id });
  } catch (error: any) {
    console.error('Error updating history item:', error);
    res.status(500).json({ error: 'Kunne ikke oppdatere historikk-element' });
  }
});

// DELETE /api/history/:id - Delete history item and associated MP3/image files
router.delete('/:id', (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;

    const existing = getHistoryItemById(id);
    if (!existing) {
      return res.status(404).json({ error: 'Historikk-element ikke funnet' });
    }

    if (existing.sunoLocalUrl) {
      const filename = existing.sunoLocalUrl.replace(/^\/mp3s\//, '');
      const filePath = path.join(__dirname, '../../mp3s', filename);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (err) {
          console.error('Error deleting MP3 file:', err);
        }
      }
    }

    if (existing.sunoImageUrl && !existing.sunoImageUrl.includes('/assets/')) {
      const imageFilename = existing.sunoImageUrl.replace(/^\/images\//, '');
      const imagePath = path.join(__dirname, '../../images', imageFilename);
      if (fs.existsSync(imagePath)) {
        try {
          fs.unlinkSync(imagePath);
        } catch (err) {
          console.error('Error deleting image file:', err);
        }
      }
    }

    deleteHistoryItem(id);
    res.json({ success: true, id });
  } catch (error: any) {
    console.error('Error deleting history item:', error);
    res.status(500).json({ error: 'Kunne ikke slette historikk-element' });
  }
});

export default router;

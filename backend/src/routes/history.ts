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

function isValidId(id: string): boolean {
  return /^[\w-]+$/.test(id);
}

function isValidFilename(filename: string): boolean {
  return !filename.includes('..') && !filename.includes('/') && !filename.includes('\\');
}

// GET /api/history - Fetch all history items
router.get('/', (req: Request, res: Response) => {
  try {
    const items = getAllHistoryItems();
    res.json(items);
  } catch (error: any) {
    console.error('Error fetching history:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// POST /api/history - Create new history item
router.post('/', (req: Request, res: Response) => {
  try {
    const item: HistoryItem = req.body;

    if (!item.id || !item.title || !item.createdAt) {
      return res.status(400).json({
        error: 'Missing required fields: id, title, createdAt',
      });
    }

    createHistoryItem(item);
    res.status(201).json({ success: true, id: item.id });
  } catch (error: any) {
    console.error('Error creating history item:', error);
    res.status(500).json({ error: 'Failed to create history item' });
  }
});

// PATCH /api/history/:id - Update history item
router.patch('/:id', (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }

    const updates: Partial<HistoryItem> = req.body;

    // Check if item exists
    const existing = getHistoryItemById(id);
    if (!existing) {
      return res.status(404).json({ error: 'History item not found' });
    }

    updateHistoryItem(id, updates);
    res.json({ success: true, id });
  } catch (error: any) {
    console.error('Error updating history item:', error);
    res.status(500).json({ error: 'Failed to update history item' });
  }
});

// DELETE /api/history/:id - Delete history item and associated MP3/image files
router.delete('/:id', (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }

    const existing = getHistoryItemById(id);
    if (!existing) {
      return res.status(404).json({ error: 'History item not found' });
    }

    if (existing.sunoLocalUrl) {
      const filename = existing.sunoLocalUrl.replace(/^\/mp3s\//, '');
      if (isValidFilename(filename)) {
        const filePath = path.join(__dirname, '../../mp3s', filename);
        if (fs.existsSync(filePath)) {
          try {
            fs.unlinkSync(filePath);
          } catch (err) {
            console.error('Error deleting MP3 file:', err);
          }
        }
      }
    }

    if (existing.sunoImageUrl && !existing.sunoImageUrl.includes('/assets/')) {
      const imageFilename = existing.sunoImageUrl.replace(/^\/images\//, '');
      if (isValidFilename(imageFilename)) {
        const imagePath = path.join(__dirname, '../../images', imageFilename);
        if (fs.existsSync(imagePath)) {
          try {
            fs.unlinkSync(imagePath);
          } catch (err) {
            console.error('Error deleting image file:', err);
          }
        }
      }
    }

    deleteHistoryItem(id);
    res.json({ success: true, id });
  } catch (error: any) {
    console.error('Error deleting history item:', error);
    res.status(500).json({ error: 'Failed to delete history item' });
  }
});

export default router;

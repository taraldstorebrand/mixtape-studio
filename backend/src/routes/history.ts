import { Router, Request, Response } from 'express';
import {
  getAllHistoryItems,
  getHistoryItemById,
  createHistoryItem,
  createHistoryItemsBulk,
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

// POST /api/history/bulk - Bulk create history items (for migration)
router.post('/bulk', (req: Request, res: Response) => {
  try {
    const items: HistoryItem[] = req.body;

    if (!Array.isArray(items)) {
      return res.status(400).json({ error: 'Body må være en array av historikk-elementer' });
    }

    if (items.length === 0) {
      return res.json({ success: true, count: 0 });
    }

    // Validate all items have required fields
    for (const item of items) {
      if (!item.id || !item.prompt || !item.title || !item.lyrics || !item.createdAt) {
        return res.status(400).json({
          error: 'Alle elementer må ha: id, prompt, title, lyrics, createdAt',
        });
      }
    }

    createHistoryItemsBulk(items);
    res.status(201).json({ success: true, count: items.length });
  } catch (error: any) {
    console.error('Error bulk creating history items:', error);
    res.status(500).json({ error: 'Kunne ikke opprette historikk-elementer' });
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

// DELETE /api/history/:id - Delete history item
router.delete('/:id', (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;

    // Check if item exists
    const existing = getHistoryItemById(id);
    if (!existing) {
      return res.status(404).json({ error: 'Historikk-element ikke funnet' });
    }

    deleteHistoryItem(id);
    res.json({ success: true, id });
  } catch (error: any) {
    console.error('Error deleting history item:', error);
    res.status(500).json({ error: 'Kunne ikke slette historikk-element' });
  }
});

export default router;

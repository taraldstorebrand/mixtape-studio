import { Router, Request, Response } from 'express';
import { getAllGenres, addGenre, removeGenre } from '../db';

const router = Router();

// GET /api/genres - Fetch all genres
router.get('/', (req: Request, res: Response) => {
  try {
    const genres = getAllGenres();
    res.json(genres);
  } catch (error: any) {
    console.error('Error fetching genres:', error);
    res.status(500).json({ error: 'Kunne ikke hente sjangre' });
  }
});

// POST /api/genres - Add genre
router.post('/', (req: Request, res: Response) => {
  try {
    const { genre } = req.body;

    if (!genre || typeof genre !== 'string' || genre.trim().length === 0) {
      return res.status(400).json({
        error: 'Genre er påkrevd og må være en ikke-tom streng',
      });
    }

    addGenre(genre.trim());
    res.status(201).json({ success: true, genre: genre.trim() });
  } catch (error: any) {
    console.error('Error adding genre:', error);
    res.status(500).json({ error: 'Kunne ikke legge til sjanger' });
  }
});

// DELETE /api/genres/:genre - Remove genre
router.delete('/:genre', (req: Request<{ genre: string }>, res: Response) => {
  try {
    const { genre } = req.params;

    if (!genre) {
      return res.status(400).json({ error: 'Genre er påkrevd' });
    }

    removeGenre(decodeURIComponent(genre));
    res.json({ success: true, genre: decodeURIComponent(genre) });
  } catch (error: any) {
    console.error('Error removing genre:', error);
    res.status(500).json({ error: 'Kunne ikke fjerne sjanger' });
  }
});

export default router;

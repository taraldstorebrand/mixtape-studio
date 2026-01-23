import { Router, Request, Response } from 'express';
import { generateLyrics } from '../services/openai';

const router = Router();

router.post('/generate-lyrics', async (req: Request, res: Response) => {
  try {
    const { prompt } = req.body;

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Prompt er påkrevd og må være en ikke-tom streng' 
      });
    }

    const lyrics = await generateLyrics(prompt.trim());
    
    res.json({ lyrics });
  } catch (error: any) {
    console.error('Error generating lyrics:', error);
    res.status(500).json({ 
      error: error.message || 'Kunne ikke generere sangtekst' 
    });
  }
});

export default router;

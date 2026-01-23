import { Router, Request, Response } from 'express';
import { generateSong, getSongStatus } from '../services/suno';

const router = Router();

router.post('/generate', async (req: Request, res: Response) => {
  try {
    const { lyrics, genre, title } = req.body;

    if (!lyrics || typeof lyrics !== 'string' || lyrics.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Lyrics er påkrevd og må være en ikke-tom streng' 
      });
    }

    const result = await generateSong(lyrics.trim(), genre, title);
    
    res.json(result);
  } catch (error: any) {
    console.error('Error generating song:', error);
    res.status(500).json({ 
      error: error.message || 'Kunne ikke generere sang' 
    });
  }
});

router.get('/status/:jobId', async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;

    if (!jobId || Array.isArray(jobId)) {
      return res.status(400).json({ error: 'Job ID er påkrevd' });
    }

    const status = await getSongStatus(jobId);
    
    res.json(status);
  } catch (error: any) {
    console.error('Error getting song status:', error);
    res.status(500).json({ 
      error: error.message || 'Kunne ikke hente status' 
    });
  }
});

export default router;

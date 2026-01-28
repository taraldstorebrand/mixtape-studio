import { Router, Request, Response } from 'express';
import { config } from '../config';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  res.json({
    openai: !!config.openaiApiKey,
    suno: !!config.sunoApiKey,
  });
});

export default router;

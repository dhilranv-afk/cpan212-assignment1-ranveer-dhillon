
import { Router } from 'express';
import { getCacheStats } from '../lib/weather.js';

export const cacheRouter = Router();

cacheRouter.get('/cache/stats', (req, res) => {
  res.json({ data: getCacheStats() });
});


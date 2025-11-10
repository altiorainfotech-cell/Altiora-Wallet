import { Router } from 'express';
import { z } from 'zod';
import { cache } from '../lib/cache';
import { getSpotPrices, getHistory } from '../services/prices';

export const pricesRouter = Router();

pricesRouter.get('/prices', async (req, res) => {
  const schema = z.object({ symbols: z.string().optional() });
  const parsed = schema.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const symbols = (parsed.data.symbols || '').split(',').map(s => s.trim().toUpperCase()).filter(Boolean);
  const key = `prices:${symbols.sort().join(',')}` || 'prices:all';
  const cached = cache.get<any>(key);
  if (cached) return res.json({ prices: cached, cached: true });
  const src = symbols.length ? symbols : ['ETH','USDC','USDT','BTC','MATIC','SOL','LINK','ARB','OP'];
  const out = await getSpotPrices(src);
  cache.set(key, out, 30_000); // 30s TTL
  res.json({ prices: out, cached: false });
});

pricesRouter.get('/prices/history', async (req, res) => {
  const schema = z.object({ symbol: z.string(), days: z.coerce.number().min(1).max(365).default(7), interval: z.enum(['hourly','daily']).default('daily') });
  const parsed = schema.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { symbol, days, interval } = parsed.data;
  const key = `history:${symbol}:${days}:${interval}`;
  const cached = cache.get<any>(key);
  if (cached) return res.json({ symbol: symbol.toUpperCase(), points: cached, cached: true });
  const points = await getHistory(symbol, days, interval);
  cache.set(key, points, 10 * 60_000); // 10 minutes TTL
  res.json({ symbol: symbol.toUpperCase(), points, cached: false });
});

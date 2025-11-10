import { Router } from 'express';
import { z } from 'zod';
import { cache } from '../lib/cache';

export const portfolioRouter = Router();

// Demo portfolio generator (no external RPC/indexer calls)
function demoPortfolio(address: string, chain: string) {
  // Provide stable, fake balances based on address hash to avoid randomness
  const hash = Array.from(address).reduce((a, c) => (a + c.charCodeAt(0)) % 1000, 0);
  const eth = (hash % 10) / 10; // 0.0 - 0.9 ETH
  const usdc = (hash % 500);
  const holdings = [
    { id: 'eth', symbol: 'ETH', balance: eth, usd: eth * 2718.03 },
    { id: 'usdc', symbol: 'USDC', balance: usdc, usd: usdc * 1.0 },
  ];
  const totalUsd = holdings.reduce((s, h) => s + h.usd, 0);
  return { chain, address, totalUsd, change24hPct: 1.23, holdings };
}

portfolioRouter.get('/portfolio/:address', async (req, res) => {
  const schema = z.object({ chain: z.string().default('sepolia') });
  const parsed = schema.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { address } = req.params;
  const { chain } = parsed.data;
  const key = `portfolio:${chain}:${address.toLowerCase()}`;
  const cached = cache.get<any>(key);
  if (cached) return res.json({ ...cached, cached: true });
  const data = demoPortfolio(address, chain);
  cache.set(key, data, 120_000); // 120s TTL
  res.json({ ...data, cached: false });
});


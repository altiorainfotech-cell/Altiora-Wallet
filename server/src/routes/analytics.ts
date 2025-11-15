import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';
import { cache } from '../lib/cache';

export const analyticsRouter = Router();

// Portfolio performance analytics
analyticsRouter.get('/analytics/portfolio/:address', requireAuth, async (req: AuthRequest, res) => {
  const { address } = req.params;
  const schema = z.object({ chain: z.string().default('sepolia'), days: z.coerce.number().min(1).max(90).default(30) });
  const parsed = schema.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  
  const { chain, days } = parsed.data;
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  
  const snapshots = await prisma.portfolioSnapshot.findMany({
    where: { userId: req.userId!, address: address.toLowerCase(), chain, createdAt: { gte: since } },
    orderBy: { createdAt: 'asc' }
  });
  
  const performance = snapshots.map(s => ({
    timestamp: s.createdAt,
    totalUsd: s.totalUsd,
    change24h: s.change24h
  }));
  
  const current = snapshots[snapshots.length - 1];
  const initial = snapshots[0];
  const totalReturn = current && initial ? ((current.totalUsd - initial.totalUsd) / initial.totalUsd) * 100 : 0;
  
  res.json({ address, chain, performance, totalReturn, snapshots: snapshots.length });
});

// P&L tracking
analyticsRouter.get('/analytics/pnl/:address', requireAuth, async (req: AuthRequest, res) => {
  const { address } = req.params;
  const schema = z.object({ chain: z.string().default('sepolia') });
  const parsed = schema.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  
  const { chain } = parsed.data;
  const key = `pnl:${address}:${chain}`;
  const cached = cache.get<any>(key);
  if (cached) return res.json({ ...cached, cached: true });
  
  // Mock P&L data - replace with real calculation
  const hash = Array.from(address).reduce((a, c) => (a + c.charCodeAt(0)) % 1000, 0);
  const pnl = {
    realized: (hash % 100) - 50, // -50 to +49
    unrealized: (hash % 200) - 100, // -100 to +99
    totalPnl: 0,
    winRate: (hash % 80) + 20, // 20-99%
    bestTrade: (hash % 50) + 10,
    worstTrade: -(hash % 30) - 5
  };
  pnl.totalPnl = pnl.realized + pnl.unrealized;
  
  cache.set(key, pnl, 300_000); // 5min TTL
  res.json({ ...pnl, cached: false });
});

// Price alerts
analyticsRouter.get('/analytics/alerts', requireAuth, async (req: AuthRequest, res) => {
  const alerts = await prisma.priceAlert.findMany({
    where: { userId: req.userId! },
    orderBy: { createdAt: 'desc' }
  });
  res.json({ alerts });
});

analyticsRouter.post('/analytics/alerts', requireAuth, async (req: AuthRequest, res) => {
  const schema = z.object({
    tokenId: z.string().min(1),
    condition: z.enum(['above', 'below']),
    price: z.number().positive()
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  
  const alert = await prisma.priceAlert.create({
    data: { ...parsed.data, userId: req.userId! }
  });
  res.status(201).json({ alert });
});

analyticsRouter.delete('/analytics/alerts/:id', requireAuth, async (req: AuthRequest, res) => {
  const { id } = req.params;
  const alert = await prisma.priceAlert.findFirst({ where: { id, userId: req.userId! } });
  if (!alert) return res.status(404).json({ error: 'Alert not found' });
  
  await prisma.priceAlert.delete({ where: { id } });
  res.json({ ok: true });
});

// Store portfolio snapshot (called periodically)
analyticsRouter.post('/analytics/snapshot', requireAuth, async (req: AuthRequest, res) => {
  const schema = z.object({
    address: z.string().min(1),
    chain: z.string().min(1),
    totalUsd: z.number(),
    change24h: z.number(),
    data: z.any()
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  
  const snapshot = await prisma.portfolioSnapshot.create({
    data: { ...parsed.data, userId: req.userId! }
  });
  res.status(201).json({ snapshot });
});
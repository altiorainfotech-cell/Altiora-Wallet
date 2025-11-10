import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';

export const watchlistRouter = Router();

watchlistRouter.get('/watchlist', requireAuth, async (req: AuthRequest, res) => {
  const items = await prisma.watchlistItem.findMany({ where: { userId: req.userId! }, orderBy: { addedAt: 'asc' } });
  res.json({ items });
});

watchlistRouter.post('/watchlist', requireAuth, async (req: AuthRequest, res) => {
  const schema = z.object({ tokenId: z.string().min(1) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const existing = await prisma.watchlistItem.findFirst({ where: { userId: req.userId!, tokenId: parsed.data.tokenId } });
  if (existing) return res.status(200).json({ item: existing });
  const item = await prisma.watchlistItem.create({ data: { userId: req.userId!, tokenId: parsed.data.tokenId } });
  res.status(201).json({ item });
});

watchlistRouter.delete('/watchlist/:id', requireAuth, async (req: AuthRequest, res) => {
  const id = req.params.id;
  const found = await prisma.watchlistItem.findFirst({ where: { id, userId: req.userId! } });
  if (!found) return res.status(404).json({ error: 'Not found' });
  await prisma.watchlistItem.delete({ where: { id } });
  res.json({ ok: true });
});


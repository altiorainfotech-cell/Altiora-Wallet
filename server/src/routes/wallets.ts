import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';

export const walletsRouter = Router();

walletsRouter.get('/wallets', requireAuth, async (req: AuthRequest, res) => {
  const wallets = await prisma.walletAddress.findMany({ where: { userId: req.userId! }, orderBy: { createdAt: 'asc' } });
  res.json({ wallets });
});

walletsRouter.post('/wallets', requireAuth, async (req: AuthRequest, res) => {
  const schema = z.object({ chain: z.string().min(1), address: z.string().min(10), label: z.string().min(1).optional() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const wallet = await prisma.walletAddress.create({ data: { ...parsed.data, userId: req.userId! } });
  res.status(201).json({ wallet });
});

walletsRouter.delete('/wallets/:id', requireAuth, async (req: AuthRequest, res) => {
  const id = req.params.id;
  const found = await prisma.walletAddress.findFirst({ where: { id, userId: req.userId! } });
  if (!found) return res.status(404).json({ error: 'Not found' });
  await prisma.walletAddress.delete({ where: { id } });
  res.json({ ok: true });
});


import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';

export const meRouter = Router();

meRouter.get('/me', requireAuth, async (req: AuthRequest, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: {
      id: true,
      email: true,
      displayName: true,
      profilePicture: true,
      provider: true
    }
  });
  if (!user) return res.status(404).json({ error: 'Not found' });
  res.json({ user });
});

meRouter.post('/me/push-token', requireAuth, async (req: AuthRequest, res) => {
  const schema = z.object({ expoToken: z.string().min(10), platform: z.enum(['ios','android','web']) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { expoToken, platform } = parsed.data;
  await prisma.pushToken.upsert({
    where: { expoToken },
    update: { userId: req.userId!, platform },
    create: { expoToken, platform, userId: req.userId! },
  });
  res.json({ ok: true });
});


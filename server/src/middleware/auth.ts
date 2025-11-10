import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../lib/jwt';
import { prisma } from '../lib/prisma';

export type AuthRequest = Request & { userId?: string };

export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : undefined;
  if (!token) return res.status(401).json({ error: 'Missing token' });
  try {
    const payload = verifyAccessToken(token);
    // Verify tokenVersion matches current user
    const user = await prisma.user.findUnique({ where: { id: payload.sub }, select: { tokenVersion: true } });
    if (!user || user.tokenVersion !== payload.tv) return res.status(401).json({ error: 'Invalid token' });
    req.userId = payload.sub;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}


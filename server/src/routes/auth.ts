import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { prisma } from '../lib/prisma';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../lib/jwt';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { verifyGoogleToken } from '../lib/googleAuth';

const router = Router();

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  displayName: z.string().min(1).max(50).optional(),
});

router.post('/register', async (req, res) => {
  const parsed = credentialsSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { email, password, displayName } = parsed.data;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(409).json({ error: 'Email already registered' });
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { email, passwordHash, displayName } });
  const accessToken = signAccessToken(user.id, user.tokenVersion);
  const refreshToken = signRefreshToken(user.id, user.tokenVersion);
  res.json({ user: { id: user.id, email: user.email, displayName: user.displayName }, accessToken, refreshToken });
});

router.post('/login', async (req, res) => {
  const parsed = credentialsSchema.pick({ email: true, password: true }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
  const accessToken = signAccessToken(user.id, user.tokenVersion);
  const refreshToken = signRefreshToken(user.id, user.tokenVersion);
  res.json({ user: { id: user.id, email: user.email, displayName: user.displayName }, accessToken, refreshToken });
});

router.post('/refresh', async (req, res) => {
  const schema = z.object({ refreshToken: z.string().min(1) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  try {
    const payload = verifyRefreshToken(parsed.data.refreshToken);
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user || user.tokenVersion !== payload.tv) return res.status(401).json({ error: 'Invalid refresh token' });
    const accessToken = signAccessToken(user.id, user.tokenVersion);
    const refreshToken = signRefreshToken(user.id, user.tokenVersion);
    res.json({ accessToken, refreshToken });
  } catch (e) {
    return res.status(401).json({ error: 'Invalid refresh token' });
  }
});

router.post('/logout', requireAuth, async (req: AuthRequest, res) => {
  if (!req.userId) return res.status(401).json({ error: 'Unauthorized' });
  await prisma.user.update({ where: { id: req.userId }, data: { tokenVersion: { increment: 1 } } });
  res.json({ ok: true });
});

// Google OAuth Sign-In
router.post('/google', async (req, res) => {
  const schema = z.object({
    idToken: z.string().min(1),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  try {
    const { idToken } = parsed.data;
    const googleUser = await verifyGoogleToken(idToken);

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email: googleUser.email },
    });

    if (user) {
      // Update existing user with Google info if not already set
      if (!user.googleId && user.provider === 'email') {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            googleId: googleUser.sub,
            provider: 'google',
            profilePicture: googleUser.picture,
            displayName: user.displayName || googleUser.name,
          },
        });
      } else if (user.provider === 'google' && user.googleId !== googleUser.sub) {
        return res.status(401).json({ error: 'Email already registered with different Google account' });
      }
    } else {
      // Create new user
      user = await prisma.user.create({
        data: {
          email: googleUser.email,
          googleId: googleUser.sub,
          displayName: googleUser.name,
          profilePicture: googleUser.picture,
          provider: 'google',
          passwordHash: null,
        },
      });
    }

    const accessToken = signAccessToken(user.id, user.tokenVersion);
    const refreshToken = signRefreshToken(user.id, user.tokenVersion);

    res.json({
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        profilePicture: user.profilePicture,
        provider: user.provider,
      },
      accessToken,
      refreshToken,
    });
  } catch (error: any) {
    console.error('Google auth error:', error);
    return res.status(401).json({ error: error.message || 'Google authentication failed' });
  }
});

export const authRouter = router;


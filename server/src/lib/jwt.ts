import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export type JwtPayload = { sub: string; tv: number };

export function signAccessToken(userId: string, tokenVersion: number) {
  const payload: JwtPayload = { sub: userId, tv: tokenVersion };
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.ACCESS_TOKEN_TTL,
  });
}

export function signRefreshToken(userId: string, tokenVersion: number) {
  const payload: JwtPayload = { sub: userId, tv: tokenVersion };
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.REFRESH_TOKEN_TTL,
  });
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;
}

export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtPayload;
}


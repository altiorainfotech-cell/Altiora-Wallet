import dotenv from 'dotenv';

dotenv.config();

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: Number(process.env.PORT || 4000),
  API_PREFIX: process.env.API_PREFIX || '/api',
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'dev-access-secret',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret',
  ACCESS_TOKEN_TTL: process.env.ACCESS_TOKEN_TTL || '15m',
  REFRESH_TOKEN_TTL: process.env.REFRESH_TOKEN_TTL || '7d',
  DATABASE_URL: process.env.DATABASE_URL || '',
  PRICE_PROVIDER: process.env.PRICE_PROVIDER || '', // 'coingecko'
  COINGECKO_API_KEY: process.env.COINGECKO_API_KEY || '',
};

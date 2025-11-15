import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pino from 'pino';
import pinoHttp from 'pino-http';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import { healthRouter } from './routes/health';
import { authRouter } from './routes/auth';
import { meRouter } from './routes/me';
import { walletsRouter } from './routes/wallets';
import { watchlistRouter } from './routes/watchlist';
import walletOperationsRouter from './routes/wallet-operations';
import { transactionsRouter } from './routes/transactions';

const logger = pino({
  transport: { target: 'pino-pretty', options: { colorize: true } },
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',
});

const app = express();

app.use(helmet());
app.use(pinoHttp({
  logger,
  autoLogging: env.NODE_ENV !== 'test',
}));
app.use(rateLimit({ windowMs: 60_000, limit: 120 }));
app.use(cors({ origin: '*'}));
app.use(express.json());

app.use(env.API_PREFIX, healthRouter);
app.use(env.API_PREFIX + '/auth', authRouter);
app.use(env.API_PREFIX, meRouter);
app.use(env.API_PREFIX, walletsRouter);
app.use(env.API_PREFIX, watchlistRouter);
app.use(env.API_PREFIX + '/wallet-operations', walletOperationsRouter);
app.use(env.API_PREFIX, transactionsRouter);
// Prices and portfolio
import { pricesRouter } from './routes/prices';
import { portfolioRouter } from './routes/portfolio';
// Analytics and Chat
import { analyticsRouter } from './routes/analytics';
import { chatRouter } from './routes/chat';
app.use(env.API_PREFIX, pricesRouter);
app.use(env.API_PREFIX, portfolioRouter);
app.use(env.API_PREFIX, analyticsRouter);
app.use(env.API_PREFIX, chatRouter);

app.get('/', (_req, res) => {
  res.send('Wallet API');
});

app.use((err: any, _req: any, res: any, _next: any) => {
  logger.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(env.PORT, () => {
  logger.info(`Server listening on http://localhost:${env.PORT}`);
  logger.info(`Health: http://localhost:${env.PORT}${env.API_PREFIX}/health`);
});

import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

/**
 * GET /api/transactions/:address
 * Get transaction history for a wallet address
 */
router.get('/transactions/:address', requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { address } = req.params;
    const { limit = '50', offset = '0', status, category } = req.query;

    // Verify wallet belongs to user
    const wallet = await prisma.wallet.findFirst({
      where: {
        userId,
        address,
      },
    });

    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    // Build where clause
    const where: any = {
      walletAddress: address,
      userId,
    };

    if (status) {
      where.status = status;
    }

    if (category) {
      where.category = category;
    }

    // Fetch transactions
    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: {
        timestamp: 'desc',
      },
      take: parseInt(limit as string),
      skip: parseInt(offset as string),
    });

    // Get total count
    const total = await prisma.transaction.count({ where });

    res.json({
      transactions,
      pagination: {
        total,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      },
    });
  } catch (error) {
    console.error('Transaction fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

/**
 * POST /api/transactions
 * Create or update a transaction (upsert)
 */
router.post('/transactions', requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const {
      hash,
      walletAddress,
      chain,
      from,
      to,
      value,
      fee = 0,
      method = 'transfer',
      status,
      category,
      metadata = {},
      timestamp,
    } = req.body;

    // Validation
    if (!hash || !walletAddress || !from || !to || !status || !category) {
      return res.status(400).json({ error: 'Missing required transaction fields' });
    }

    // Verify wallet belongs to user
    const wallet = await prisma.wallet.findFirst({
      where: {
        userId,
        address: walletAddress,
      },
    });

    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    // Upsert transaction
    const transaction = await prisma.transaction.upsert({
      where: { hash },
      update: {
        status,
        value: parseFloat(value),
        fee: parseFloat(fee),
        metadata,
        timestamp: timestamp || new Date().toISOString(),
      },
      create: {
        hash,
        walletAddress,
        chain: chain || 'sepolia',
        from,
        to,
        value: parseFloat(value),
        fee: parseFloat(fee),
        method,
        status,
        category,
        metadata,
        timestamp: timestamp || new Date().toISOString(),
        userId,
      },
    });

    res.json({ success: true, transaction });
  } catch (error) {
    console.error('Transaction upsert error:', error);
    res.status(500).json({ error: 'Failed to upsert transaction' });
  }
});

/**
 * GET /api/transactions/:address/:hash
 * Get transaction details by hash
 */
router.get('/transactions/:address/:hash', requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { address, hash } = req.params;

    // Verify wallet belongs to user
    const wallet = await prisma.wallet.findFirst({
      where: {
        userId,
        address,
      },
    });

    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    // Fetch transaction
    const transaction = await prisma.transaction.findFirst({
      where: {
        hash,
        walletAddress: address,
        userId,
      },
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json({ transaction });
  } catch (error) {
    console.error('Transaction detail fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch transaction details' });
  }
});

export { router as transactionsRouter };

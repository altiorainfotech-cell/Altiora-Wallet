import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

/**
 * POST /api/wallet-operations/send
 * Send cryptocurrency to another address
 */
router.post('/send', requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { walletAddress, toAddress, amount, tokenId = 'eth', chain } = req.body;

    // Validation
    if (!walletAddress || !toAddress || !amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid send parameters' });
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

    // Create transaction record
    const hash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

    const transaction = await prisma.transaction.create({
      data: {
        hash,
        walletAddress,
        chain: chain || 'sepolia',
        from: walletAddress,
        to: toAddress,
        value: parseFloat(amount),
        fee: 0.00002,
        method: 'transfer',
        status: 'confirmed',
        category: 'send',
        metadata: { tokenId, note: 'Send transaction' },
        timestamp: new Date().toISOString(),
        userId,
      },
    });

    res.json({
      success: true,
      transaction: {
        id: transaction.id,
        hash: transaction.hash,
        from: transaction.from,
        to: transaction.to,
        value: transaction.value,
        status: transaction.status,
        category: transaction.category,
        timestamp: transaction.timestamp,
      },
    });
  } catch (error) {
    console.error('Send transaction error:', error);
    res.status(500).json({ error: 'Failed to process send transaction' });
  }
});

/**
 * POST /api/wallet-operations/receive
 * Record received cryptocurrency
 */
router.post('/receive', requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { walletAddress, fromAddress, amount, tokenId = 'eth', chain } = req.body;

    // Validation
    if (!walletAddress || !amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid receive parameters' });
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

    // Create transaction record
    const hash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const from = fromAddress || '0x' + 'f'.repeat(40);

    const transaction = await prisma.transaction.create({
      data: {
        hash,
        walletAddress,
        chain: chain || 'sepolia',
        from,
        to: walletAddress,
        value: parseFloat(amount),
        fee: 0,
        method: 'transfer',
        status: 'confirmed',
        category: 'receive',
        metadata: { tokenId, note: 'Receive transaction' },
        timestamp: new Date().toISOString(),
        userId,
      },
    });

    res.json({
      success: true,
      transaction: {
        id: transaction.id,
        hash: transaction.hash,
        from: transaction.from,
        to: transaction.to,
        value: transaction.value,
        status: transaction.status,
        category: transaction.category,
        timestamp: transaction.timestamp,
      },
    });
  } catch (error) {
    console.error('Receive transaction error:', error);
    res.status(500).json({ error: 'Failed to process receive transaction' });
  }
});

/**
 * POST /api/wallet-operations/swap
 * Swap one cryptocurrency for another
 */
router.post('/swap', requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { walletAddress, fromTokenId, toTokenId, fromAmount, toAmount, chain } = req.body;

    // Validation
    if (!walletAddress || !fromTokenId || !toTokenId || !fromAmount || fromAmount <= 0) {
      return res.status(400).json({ error: 'Invalid swap parameters' });
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

    // Create transaction record
    const hash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

    const transaction = await prisma.transaction.create({
      data: {
        hash,
        walletAddress,
        chain: chain || 'sepolia',
        from: walletAddress,
        to: walletAddress,
        value: parseFloat(fromAmount),
        fee: 0.00003,
        method: 'swap',
        status: 'confirmed',
        category: 'swap',
        metadata: {
          fromTokenId,
          toTokenId,
          fromAmount: parseFloat(fromAmount),
          toAmount: parseFloat(toAmount || 0),
          note: `Swap ${fromTokenId} to ${toTokenId}`,
        },
        timestamp: new Date().toISOString(),
        userId,
      },
    });

    res.json({
      success: true,
      transaction: {
        id: transaction.id,
        hash: transaction.hash,
        from: transaction.from,
        to: transaction.to,
        value: transaction.value,
        status: transaction.status,
        category: transaction.category,
        metadata: transaction.metadata,
        timestamp: transaction.timestamp,
      },
    });
  } catch (error) {
    console.error('Swap transaction error:', error);
    res.status(500).json({ error: 'Failed to process swap transaction' });
  }
});

/**
 * POST /api/wallet-operations/buy
 * Purchase cryptocurrency with fiat currency
 */
router.post('/buy', requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const {
      walletAddress,
      tokenId = 'eth',
      cryptoAmount,
      fiatAmount,
      fiatCurrency = 'USD',
      paymentMethod = 'card',
      chain,
    } = req.body;

    // Validation
    if (!walletAddress || !cryptoAmount || cryptoAmount <= 0 || !fiatAmount || fiatAmount < 10) {
      return res.status(400).json({ error: 'Invalid purchase parameters. Minimum $10 required.' });
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

    // Calculate processing fee (1.5%)
    const processingFee = parseFloat((parseFloat(fiatAmount) * 0.015).toFixed(2));
    const totalFiat = parseFloat(fiatAmount) + processingFee;

    // Create transaction record
    const hash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

    const transaction = await prisma.transaction.create({
      data: {
        hash,
        walletAddress,
        chain: chain || 'sepolia',
        from: '0x0000000000000000000000000000000000000000',
        to: walletAddress,
        value: parseFloat(cryptoAmount),
        fee: 0,
        method: 'purchase',
        status: 'confirmed',
        category: 'receive',
        metadata: {
          tokenId,
          cryptoAmount: parseFloat(cryptoAmount),
          fiatAmount: parseFloat(fiatAmount),
          fiatCurrency,
          processingFee,
          totalFiat,
          paymentMethod,
          note: `Buy ${cryptoAmount} ${tokenId.toUpperCase()} for $${totalFiat}`,
        },
        timestamp: new Date().toISOString(),
        userId,
      },
    });

    res.json({
      success: true,
      transaction: {
        id: transaction.id,
        hash: transaction.hash,
        from: transaction.from,
        to: transaction.to,
        value: transaction.value,
        status: transaction.status,
        category: transaction.category,
        metadata: transaction.metadata,
        timestamp: transaction.timestamp,
      },
      purchase: {
        cryptoAmount: parseFloat(cryptoAmount),
        fiatAmount: parseFloat(fiatAmount),
        processingFee,
        totalFiat,
      },
    });
  } catch (error) {
    console.error('Buy transaction error:', error);
    res.status(500).json({ error: 'Failed to process purchase transaction' });
  }
});

/**
 * GET /api/wallet-operations/balance/:walletAddress
 * Get wallet balance
 */
router.get('/balance/:walletAddress', requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { walletAddress } = req.params;

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

    // Calculate balance from transactions
    const transactions = await prisma.transaction.findMany({
      where: {
        walletAddress,
        userId,
      },
      orderBy: {
        timestamp: 'desc',
      },
    });

    let ethBalance = 0.7107;

    transactions.forEach((tx) => {
      if (tx.category === 'send' && tx.from === walletAddress) {
        ethBalance -= tx.value || 0;
        ethBalance -= tx.fee || 0;
      } else if (tx.category === 'receive' && tx.to === walletAddress) {
        ethBalance += tx.value || 0;
      } else if (tx.category === 'swap') {
        const metadata = tx.metadata as any;
        if (metadata?.fromTokenId === 'eth') {
          ethBalance -= tx.value || 0;
        }
        if (metadata?.toTokenId === 'eth' && metadata?.toAmount) {
          ethBalance += metadata.toAmount;
        }
      }
    });

    res.json({
      walletAddress,
      balances: {
        eth: Math.max(0, ethBalance).toFixed(4),
      },
      transactionCount: transactions.length,
    });
  } catch (error) {
    console.error('Balance fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch wallet balance' });
  }
});

export default router;

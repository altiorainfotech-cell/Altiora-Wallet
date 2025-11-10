import { env } from '../config/env';

const SYMBOL_TO_ID: Record<string, string> = {
  ETH: 'ethereum',
  BTC: 'bitcoin',
  USDC: 'usd-coin',
  USDT: 'tether',
  MATIC: 'matic-network',
  SOL: 'solana',
  LINK: 'chainlink',
  ARB: 'arbitrum',
  OP: 'optimism',
};

const STATIC_PRICES: Record<string, number> = {
  ETH: 2718.03,
  USDC: 1.0,
  USDT: 1.0,
  BTC: 97468.75,
  MATIC: 0.72,
  SOL: 216.0,
  LINK: 13.5,
  ARB: 1.28,
  OP: 2.17,
};

type SpotPrices = Record<string, { usd: number; ts: number }>; // symbol -> {usd, ts}

export async function getSpotPrices(symbols: string[]): Promise<SpotPrices> {
  const upper = symbols.map((s) => s.toUpperCase());
  const now = Date.now();
  const result: SpotPrices = {};

  if (env.PRICE_PROVIDER !== 'coingecko') {
    for (const s of upper) result[s] = { usd: STATIC_PRICES[s] ?? 0, ts: now };
    return result;
  }

  const ids = upper.map((s) => SYMBOL_TO_ID[s]).filter(Boolean);
  if (!ids.length) return {};

  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(ids.join(','))}&vs_currencies=usd`;
  const headers: Record<string, string> = {};
  if (env.COINGECKO_API_KEY) headers['x-cg-pro-api-key'] = env.COINGECKO_API_KEY;

  try {
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error(`coingecko ${res.status}`);
    const data = await res.json() as Record<string, { usd: number }>;
    for (const sym of upper) {
      const id = SYMBOL_TO_ID[sym];
      const usd = id && data[id]?.usd != null ? data[id].usd : STATIC_PRICES[sym] ?? 0;
      result[sym] = { usd, ts: now };
    }
    return result;
  } catch {
    for (const s of upper) result[s] = { usd: STATIC_PRICES[s] ?? 0, ts: now };
    return result;
  }
}

export type HistoryPoint = { ts: number; usd: number };

export async function getHistory(symbol: string, days: number, interval: 'hourly' | 'daily' = 'daily'): Promise<HistoryPoint[]> {
  const upper = symbol.toUpperCase();
  if (env.PRICE_PROVIDER !== 'coingecko') {
    // Return a simple synthetic series around the static price
    const base = STATIC_PRICES[upper] ?? 1;
    const out: HistoryPoint[] = [];
    const stepMs = interval === 'daily' ? 86_400_000 : 3_600_000;
    const now = Date.now();
    const points = interval === 'daily' ? Math.min(days, 90) : Math.min(days * 24, 24 * 30);
    for (let i = points - 1; i >= 0; i--) {
      const ts = now - i * stepMs;
      const usd = base * (1 + 0.01 * Math.sin(i / 3));
      out.push({ ts, usd: Number(usd.toFixed(4)) });
    }
    return out;
  }

  const id = SYMBOL_TO_ID[upper];
  if (!id) return [];
  const url = `https://api.coingecko.com/api/v3/coins/${encodeURIComponent(id)}/market_chart?vs_currency=usd&days=${encodeURIComponent(String(days))}&interval=${encodeURIComponent(interval)}`;
  const headers: Record<string, string> = {};
  if (env.COINGECKO_API_KEY) headers['x-cg-pro-api-key'] = env.COINGECKO_API_KEY;
  try {
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error(`coingecko ${res.status}`);
    const data = await res.json() as { prices: [number, number][] };
    return (data.prices || []).map(([ts, usd]) => ({ ts, usd }));
  } catch {
    return [];
  }
}


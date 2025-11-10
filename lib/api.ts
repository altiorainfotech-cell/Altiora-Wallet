// Simple API client for the wallet backend
// Uses public Expo env var: EXPO_PUBLIC_API_BASE_URL (e.g., http://localhost:4000/api)

const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL || '';

type Tokens = { accessToken: string | null; refreshToken: string | null };
const tokens: Tokens = { accessToken: null, refreshToken: null };
let secureStoreLoaded = false;

// Lazy-load tokens from SecureStore on first use
async function ensureLoaded() {
  if (secureStoreLoaded) return;
  try {
    const SecureStore = await import('expo-secure-store');
    const at = await SecureStore.getItemAsync('accessToken');
    const rt = await SecureStore.getItemAsync('refreshToken');
    tokens.accessToken = at || null;
    tokens.refreshToken = rt || null;
  } catch {}
  secureStoreLoaded = true;
}

export function setAuthTokens(accessToken: string, refreshToken: string) {
  tokens.accessToken = accessToken;
  tokens.refreshToken = refreshToken;
  // Persist securely
  (async () => {
    try {
      const SecureStore = await import('expo-secure-store');
      await SecureStore.setItemAsync('accessToken', accessToken);
      await SecureStore.setItemAsync('refreshToken', refreshToken);
    } catch {}
  })();
}

export function clearAuthTokens() {
  tokens.accessToken = null;
  tokens.refreshToken = null;
  (async () => {
    try {
      const SecureStore = await import('expo-secure-store');
      await SecureStore.deleteItemAsync('accessToken');
      await SecureStore.deleteItemAsync('refreshToken');
    } catch {}
  })();
}

export function isAuthed() {
  return !!tokens.accessToken;
}

async function request(path: string, init?: RequestInit) {
  if (!API_BASE) throw new Error('API base URL not set (EXPO_PUBLIC_API_BASE_URL)');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init?.headers as Record<string, string>),
  };
  await ensureLoaded();
  if (tokens.accessToken) headers['Authorization'] = `Bearer ${tokens.accessToken}`;
  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });
  // Try refresh on 401 once
  if (res.status === 401 && tokens.refreshToken) {
    const refreshed = await refresh(tokens.refreshToken);
    if (refreshed) {
      const retry = await fetch(`${API_BASE}${path}`, { ...init, headers: { ...headers, Authorization: `Bearer ${tokens.accessToken}` } });
      return retry;
    }
  }
  return res;
}

export async function register(email: string, password: string, displayName?: string) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, displayName }),
  });
  if (!res.ok) throw new Error('Register failed');
  const data = await res.json();
  setAuthTokens(data.accessToken, data.refreshToken);
  return data;
}

export async function login(email: string, password: string) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error('Login failed');
  const data = await res.json();
  setAuthTokens(data.accessToken, data.refreshToken);
  return data;
}

export async function refresh(refreshToken: string) {
  const res = await fetch(`${API_BASE}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });
  if (!res.ok) {
    clearAuthTokens();
    return false;
  }
  const data = await res.json();
  setAuthTokens(data.accessToken, data.refreshToken);
  return true;
}

export async function logout() {
  if (!tokens.accessToken) return;
  await request('/auth/logout', { method: 'POST' });
  clearAuthTokens();
}

// Domain APIs
export async function getMe() {
  const res = await request('/me');
  if (!res.ok) throw new Error('Failed to fetch profile');
  return res.json();
}

export async function registerPushToken(expoToken: string, platform: 'ios'|'android'|'web') {
  const res = await request('/me/push-token', {
    method: 'POST',
    body: JSON.stringify({ expoToken, platform })
  });
  if (!res.ok) throw new Error('Failed to register push token');
  return res.json();
}

export async function getWallets() {
  const res = await request('/wallets');
  if (!res.ok) throw new Error('Failed to fetch wallets');
  return res.json();
}

export async function createWallet(input: { chain: string; address: string; label?: string }) {
  const res = await request('/wallets', { method: 'POST', body: JSON.stringify(input) });
  if (!res.ok) throw new Error('Failed to create wallet');
  return res.json();
}

export async function deleteWallet(id: string) {
  const res = await request(`/wallets/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete wallet');
  return res.json();
}

export async function getWatchlist() {
  const res = await request('/watchlist');
  if (!res.ok) throw new Error('Failed to fetch watchlist');
  return res.json();
}

export async function addWatchlist(tokenId: string) {
  const res = await request('/watchlist', { method: 'POST', body: JSON.stringify({ tokenId }) });
  if (!res.ok) throw new Error('Failed to add to watchlist');
  return res.json();
}

export async function removeWatchlist(id: string) {
  const res = await request(`/watchlist/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to remove from watchlist');
  return res.json();
}

export async function getPrices(symbols?: string[]) {
  const q = symbols && symbols.length ? `?symbols=${symbols.join(',')}` : '';
  const res = await request(`/prices${q}`);
  if (!res.ok) throw new Error('Failed to fetch prices');
  return res.json();
}

export async function getPortfolio(address: string, chain: string) {
  const res = await request(`/portfolio/${address}?chain=${encodeURIComponent(chain)}`);
  if (!res.ok) throw new Error('Failed to fetch portfolio');
  return res.json();
}

export async function getPriceHistory(symbol: string, days = 7, interval: 'hourly'|'daily' = 'daily') {
  const res = await request(`/prices/history?symbol=${encodeURIComponent(symbol)}&days=${days}&interval=${interval}`);
  if (!res.ok) throw new Error('Failed to fetch price history');
  return res.json();
}

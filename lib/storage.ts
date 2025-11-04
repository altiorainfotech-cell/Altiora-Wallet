// Lightweight wrapper to avoid hard dependency at compile time.
// Uses dynamic import for AsyncStorage and falls back to in-memory store if unavailable.

let asyncStorage: any | null = null;
const memoryStore: Record<string, string> = {};

async function loadAsyncStorage() {
  if (asyncStorage) return asyncStorage;
  try {
    const mod = await import('@react-native-async-storage/async-storage');
    asyncStorage = mod.default ?? mod;
  } catch {
    asyncStorage = null;
  }
  return asyncStorage;
}

export async function getItem(key: string): Promise<string | null> {
  const as = await loadAsyncStorage();
  if (as) {
    try {
      return await as.getItem(key);
    } catch {}
  }
  return Object.prototype.hasOwnProperty.call(memoryStore, key) ? memoryStore[key] : null;
}

export async function setItem(key: string, value: string): Promise<boolean> {
  const as = await loadAsyncStorage();
  if (as) {
    try {
      await as.setItem(key, value);
      return true;
    } catch {}
  }
  memoryStore[key] = value;
  return false;
}


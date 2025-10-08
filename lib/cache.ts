// lib/cache.ts
const cache = new Map<string, unknown>();

export function getCache<T>(key: string): T | null {
  return (cache.get(key) as T) ?? null;
}

export function setCache<T>(key: string, value: T, ttl: number) {
  cache.set(key, value);
  setTimeout(() => cache.delete(key), ttl);
}

/**
 * Simple in-memory cache with TTL support.
 * Each entry stores the data, the timestamp it was created, and a TTL in ms.
 */

interface CacheEntry<T> {
  data: T
  cachedAt: number
  ttl: number
}

const cache = new Map<string, CacheEntry<unknown>>()

export function getCached<T>(key: string): T | null {
  const entry = cache.get(key)
  if (!entry) return null
  if (Date.now() - entry.cachedAt > entry.ttl) {
    cache.delete(key)
    return null
  }
  return entry.data as T
}

export function setCache<T>(key: string, data: T, ttlMs: number): void {
  cache.set(key, { data, cachedAt: Date.now(), ttl: ttlMs })
}

export function invalidateCache(key: string): void {
  cache.delete(key)
}

export function invalidatePattern(pattern: string): void {
  for (const key of cache.keys()) {
    if (key.includes(pattern)) {
      cache.delete(key)
    }
  }
}

export function getCacheAge(key: string): number | null {
  const entry = cache.get(key)
  if (!entry) return null
  return Date.now() - entry.cachedAt
}

// Default TTLs
export const CACHE_TTL = {
  SHORT: 60_000,       // 1 minute
  MEDIUM: 5 * 60_000,  // 5 minutes
  LONG: 15 * 60_000,   // 15 minutes
  HOUR: 60 * 60_000,   // 1 hour
}

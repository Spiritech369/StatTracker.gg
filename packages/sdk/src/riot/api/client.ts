import type { z } from 'zod'
import type { PlatformRoute, RegionalRoute } from './types.js'

export class RiotApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly path: string,
    message: string,
  ) {
    super(message)
    this.name = 'RiotApiError'
  }
}

interface RateLimiterBucket {
  limit: number
  windowMs: number
  timestamps: number[]
}

class RateLimiter {
  private buckets: RateLimiterBucket[] = []

  constructor(specs: Array<{ limit: number; windowMs: number }> = DEFAULT_DEV_LIMITS) {
    this.buckets = specs.map((s) => ({ ...s, timestamps: [] }))
  }

  async acquire(): Promise<void> {
    const now = Date.now()
    let wait = 0
    for (const b of this.buckets) {
      b.timestamps = b.timestamps.filter((t) => now - t < b.windowMs)
      if (b.timestamps.length >= b.limit) {
        const oldest = b.timestamps[0] ?? now
        wait = Math.max(wait, b.windowMs - (now - oldest))
      }
    }
    if (wait > 0) {
      await new Promise((r) => setTimeout(r, wait + 25))
      return this.acquire()
    }
    const t = Date.now()
    for (const b of this.buckets) b.timestamps.push(t)
  }
}

const DEFAULT_DEV_LIMITS = [
  { limit: 20, windowMs: 1_000 },
  { limit: 100, windowMs: 2 * 60_000 },
]

export interface RiotClientOptions {
  apiKey: string
  defaultRegional?: RegionalRoute
  defaultPlatform?: PlatformRoute
  rateLimits?: Array<{ limit: number; windowMs: number }>
  fetchImpl?: typeof fetch
  maxRetries?: number
}

export interface RiotHttpClient {
  regional: RegionalRoute
  platform: PlatformRoute
  get<T>(route: 'regional' | 'platform', path: string, schema: z.ZodType<T>): Promise<T>
}

export function createRiotHttpClient(opts: RiotClientOptions): RiotHttpClient {
  const {
    apiKey,
    defaultRegional = 'americas',
    defaultPlatform = 'na1',
    fetchImpl = fetch,
    maxRetries = 3,
  } = opts
  if (!apiKey) throw new Error('RIOT_API_KEY missing')
  const limiter = new RateLimiter(opts.rateLimits)

  async function doFetch<T>(
    route: 'regional' | 'platform',
    path: string,
    schema: z.ZodType<T>,
  ): Promise<T> {
    const host = route === 'regional' ? defaultRegional : defaultPlatform
    const url = `https://${host}.api.riotgames.com${path}`

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      await limiter.acquire()
      const res = await fetchImpl(url, { headers: { 'X-Riot-Token': apiKey } })

      if (res.status === 429 && attempt < maxRetries) {
        const retry = Number(res.headers.get('Retry-After') ?? '1')
        await new Promise((r) => setTimeout(r, retry * 1000))
        continue
      }
      if (!res.ok) {
        throw new RiotApiError(res.status, path, `Riot API ${path} failed: ${res.status}`)
      }
      return schema.parse(await res.json())
    }
    throw new RiotApiError(429, path, `Riot API ${path} exceeded max retries`)
  }

  return {
    regional: defaultRegional,
    platform: defaultPlatform,
    get: doFetch,
  }
}

import { createRiotClient, type RiotClient } from '@trackerstat/sdk/riot'
import { env } from './env.js'

let cached: RiotClient | null = null

export function getRiotClient(): RiotClient {
  if (cached) return cached
  if (!env.RIOT_API_KEY) throw new Error('RIOT_API_KEY is not configured')
  cached = createRiotClient({
    apiKey: env.RIOT_API_KEY,
    defaultRegional: env.RIOT_REGIONAL,
  })
  return cached
}

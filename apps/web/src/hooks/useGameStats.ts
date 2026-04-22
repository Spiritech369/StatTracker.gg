'use client'

import { useQuery } from '@tanstack/react-query'

// ─── Types ───────────────────────────────────

export interface GameEntity {
  name: string
  role: string
  winrate: number
  pickrate: number
  banrate?: number
  tier: 'S' | 'A' | 'B' | 'C'
  trend: 'up' | 'down' | 'stable'
  trendChange: number
  kda?: number
  placementRate?: number
  difficulty?: string
  carryUnits?: string[]
}

export interface MetaInsight {
  title: string
  items: { label: string; value: string; sublabel?: string }[]
}

export interface GameStatsResponse {
  entities: GameEntity[]
  patchLabel: string
  lastUpdated: number
  source: string
  metaInsights: MetaInsight[]
  error?: string
}

export type GameId =
  | 'lol'
  | 'tft'
  | 'valorant'
  | 'deadlock'
  | 'dota2'
  | 'rematch'
  | 'wow'
  | 'helldivers2'
  | '2xko'

// ─── Hook ────────────────────────────────────

interface UseGameStatsOptions {
  gameId: GameId
  enabled?: boolean
  refetchInterval?: number | false
}

export function useGameStats({
  gameId,
  enabled = true,
  refetchInterval = 5 * 60 * 1000,
}: UseGameStatsOptions) {
  return useQuery<GameStatsResponse>({
    queryKey: ['gameStats', gameId],
    queryFn: async (): Promise<GameStatsResponse> => {
      const res = await fetch(`/api/stats/${gameId}`)
      if (!res.ok) {
        throw new Error(`Failed to fetch ${gameId} stats`)
      }
      return res.json()
    },
    enabled,
    refetchInterval,
    staleTime: 2 * 60 * 1000, // 2 min stale
    gcTime: 10 * 60 * 1000, // 10 min garbage collection
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  })
}

// ─── Utility: format last updated time ──────

export function formatLastUpdated(timestamp: number): string {
  if (!timestamp) return 'Never'
  const seconds = Math.floor((Date.now() - timestamp) / 1000)
  if (seconds < 10) return 'Just now'
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  return `${hours}h ago`
}

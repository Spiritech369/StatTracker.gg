'use client'

import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { trpc } from '@/lib/trpc'

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
  const isLol = gameId === 'lol'

  const lolQuery = trpc.lol.getChampionStats.useQuery(undefined, {
    enabled: enabled && isLol,
    refetchInterval: isLol ? refetchInterval : false,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
  })

  const mockQuery = useQuery<GameStatsResponse>({
    queryKey: ['gameStats', gameId],
    queryFn: async () => {
      const res = await fetch(`/api/stats/${gameId}`)
      if (!res.ok) throw new Error(`Failed to fetch ${gameId} stats`)
      return res.json()
    },
    enabled: enabled && !isLol,
    refetchInterval: !isLol ? refetchInterval : false,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  })

  const data = useMemo<GameStatsResponse | undefined>(() => {
    if (isLol) {
      if (!lolQuery.data) return undefined
      return {
        entities: lolQuery.data.entities,
        patchLabel: lolQuery.data.patchLabel,
        lastUpdated: lolQuery.data.lastUpdated,
        source: lolQuery.data.source,
        metaInsights: lolQuery.data.metaInsights,
      }
    }
    return mockQuery.data
  }, [isLol, lolQuery.data, mockQuery.data])

  const active = isLol ? lolQuery : mockQuery

  return {
    data,
    isLoading: active.isLoading,
    isFetching: active.isFetching,
    isError: active.isError,
    error: active.error,
    refetch: active.refetch,
  }
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

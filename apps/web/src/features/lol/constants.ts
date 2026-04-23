export type LoLRole = 'Top' | 'Jungle' | 'Mid' | 'ADC' | 'Support'

export interface LoLChampion {
  name: string
  role: LoLRole
  winrate: number
  pickrate: number
  banrate: number
  tier: 'S' | 'A' | 'B' | 'C'
  trend: 'up' | 'down' | 'stable'
  trendChange: number
  games: number
}

export const LOL_ROLES: {
  id: LoLRole | 'All'
  label: string
  color: string
  bgColor: string
}[] = [
  { id: 'All', label: 'Todos', color: 'text-foreground', bgColor: 'bg-white/10' },
  {
    id: 'Top',
    label: 'Top',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10 border-orange-500/30',
  },
  {
    id: 'Jungle',
    label: 'Jungle',
    color: 'text-green-400',
    bgColor: 'bg-green-500/10 border-green-500/30',
  },
  { id: 'Mid', label: 'Mid', color: 'text-cyan-400', bgColor: 'bg-cyan-500/10 border-cyan-500/30' },
  { id: 'ADC', label: 'ADC', color: 'text-red-400', bgColor: 'bg-red-500/10 border-red-500/30' },
  {
    id: 'Support',
    label: 'Support',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/10 border-yellow-500/30',
  },
]

export const ROLE_COLORS: Record<
  LoLRole,
  { text: string; bg: string; border: string; dot: string }
> = {
  Top: {
    text: 'text-orange-400',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/30',
    dot: 'bg-orange-400',
  },
  Jungle: {
    text: 'text-green-400',
    bg: 'bg-green-500/10',
    border: 'border-green-500/30',
    dot: 'bg-green-400',
  },
  Mid: {
    text: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/30',
    dot: 'bg-cyan-400',
  },
  ADC: {
    text: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    dot: 'bg-red-400',
  },
  Support: {
    text: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
    dot: 'bg-yellow-400',
  },
}

export const TIER_STYLES: Record<string, { text: string; bg: string; border: string }> = {
  S: { text: 'text-yellow-400', bg: 'bg-yellow-500/15', border: 'border-yellow-500/30' },
  A: { text: 'text-emerald-400', bg: 'bg-emerald-500/15', border: 'border-emerald-500/30' },
  B: { text: 'text-blue-400', bg: 'bg-blue-500/15', border: 'border-blue-500/30' },
  C: { text: 'text-violet-400', bg: 'bg-violet-500/15', border: 'border-violet-500/30' },
}

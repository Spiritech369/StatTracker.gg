import type { Game } from './types'

export interface AccentPalette {
  primary: string
  hover: string
  bg: string
  text: string
  border: string
  gradient: string
  button: string
  buttonHover: string
}

export const ACCENT_MAP: Record<string, AccentPalette> = {
  red: {
    primary: 'bg-red-500',
    hover: 'hover:bg-red-400',
    bg: 'bg-red-500/10',
    text: 'text-red-400',
    border: 'border-red-500/30',
    gradient: 'from-red-500/20 to-red-600/5',
    button: 'bg-red-500',
    buttonHover: 'hover:bg-red-400',
  },
  amber: {
    primary: 'bg-amber-500',
    hover: 'hover:bg-amber-400',
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    border: 'border-amber-500/30',
    gradient: 'from-amber-500/20 to-amber-600/5',
    button: 'bg-amber-500',
    buttonHover: 'hover:bg-amber-400',
  },
  violet: {
    primary: 'bg-violet-500',
    hover: 'hover:bg-violet-400',
    bg: 'bg-violet-500/10',
    text: 'text-violet-400',
    border: 'border-violet-500/30',
    gradient: 'from-violet-500/20 to-violet-600/5',
    button: 'bg-violet-500',
    buttonHover: 'hover:bg-violet-400',
  },
  rose: {
    primary: 'bg-rose-500',
    hover: 'hover:bg-rose-400',
    bg: 'bg-rose-500/10',
    text: 'text-rose-400',
    border: 'border-rose-500/30',
    gradient: 'from-rose-500/20 to-rose-600/5',
    button: 'bg-rose-500',
    buttonHover: 'hover:bg-rose-400',
  },
  emerald: {
    primary: 'bg-emerald-500',
    hover: 'hover:bg-emerald-400',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    border: 'border-emerald-500/30',
    gradient: 'from-emerald-500/20 to-emerald-600/5',
    button: 'bg-emerald-500',
    buttonHover: 'hover:bg-emerald-400',
  },
  purple: {
    primary: 'bg-purple-500',
    hover: 'hover:bg-purple-400',
    bg: 'bg-purple-500/10',
    text: 'text-purple-400',
    border: 'border-purple-500/30',
    gradient: 'from-purple-500/20 to-purple-600/5',
    button: 'bg-purple-500',
    buttonHover: 'hover:bg-purple-400',
  },
  orange: {
    primary: 'bg-orange-500',
    hover: 'hover:bg-orange-400',
    bg: 'bg-orange-500/10',
    text: 'text-orange-400',
    border: 'border-orange-500/30',
    gradient: 'from-orange-500/20 to-orange-600/5',
    button: 'bg-orange-500',
    buttonHover: 'hover:bg-orange-400',
  },
  green: {
    primary: 'bg-green-500',
    hover: 'hover:bg-green-400',
    bg: 'bg-green-500/10',
    text: 'text-green-400',
    border: 'border-green-500/30',
    gradient: 'from-green-500/20 to-green-600/5',
    button: 'bg-green-500',
    buttonHover: 'hover:bg-green-400',
  },
}

export type RoleColorPalette = { text: string; bg: string; border: string; dot: string }

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

export interface GameRoleDef {
  id: string
  label: string
  color: string
  bgColor: string
  dotColor: string
  borderColor?: string
}

export interface GameHomeConfig {
  game: Game
  entities: GameEntity[]
  roles: GameRoleDef[]
  roleColors: Record<string, RoleColorPalette>
  patchLabel: string
  searchPlaceholder: string
  entityLabel: string
  entityIcon: string
  secondaryStatLabel?: string
  showKda?: boolean
  showPlacement?: boolean
  showBanRate?: boolean
  metaInsights?: { title: string; items: { label: string; value: string; sublabel?: string }[] }[]
}

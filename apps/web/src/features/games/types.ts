import type { LucideIcon } from 'lucide-react'

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

export interface TierRow {
  tier: string
  color: string
  champions: { name: string; winrate: string; pick: string; role: string }[]
}

export interface SidebarSection {
  id: string
  label: string
  icon: LucideIcon
}

export interface NavGameItem {
  id: GameId
  name: string
  shortName: string
  icon: LucideIcon
  dotColor: string
  badge?: { text: string; color: string; bgColor: string }
}

export interface Game {
  id: GameId
  name: string
  shortName: string
  tagline: string
  badge?: { text: string; color: string }
  image?: string
  gradientBg: string
  accentColor: string
  accentHover: string
  icon: LucideIcon
  iconColor: string
  tierList?: TierRow[]
  features: { title: string; stat: string; sub: string }[]
  isComingSoon?: boolean
}

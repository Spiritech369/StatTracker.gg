'use client'

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Trophy,
  Search,
  TrendingUp,
  Shield,
  Target,
  Zap,
  ChevronRight,
  ChevronLeft,
  Gamepad2,
  Crosshair,
  Swords,
  Crown,
  Star,
  ArrowRight,
  BarChart3,
  Brain,
  Users,
  Globe,
  Check,
  Menu,
  X,
  Flame,
  Eye,
  Home as HomeIcon,
  LayoutDashboard,
  Wrench,
  Sparkles,
  RotateCcw,
  ChevronDown,
  ArrowUpRight,
  ChevronsLeft,
  ChevronsRight,
  Skull,
  Rocket,
  Compass,
  Keyboard,
  Timer,
  Activity,
  Layers,
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, CartesianGrid } from 'recharts'
import { Toaster, toast } from 'sonner'
import { useGameStats, formatLastUpdated, type GameStatsResponse } from '@/hooks/useGameStats'
import { useAnimatedCounter, useMouseGlow, useCardTilt } from '@/hooks/useAnimatedCounter'
import { RefreshCw, Loader2, Wifi, WifiOff } from 'lucide-react'
import { FloatingParticles } from '@/components/FloatingParticles'
import { ScrollProgress } from '@/components/ScrollProgress'

/* ────────────────────────────────────
   TYPES
   ──────────────────────────────────── */

type GameId = 'lol' | 'tft' | 'valorant' | 'deadlock' | 'dota2' | 'rematch' | 'wow' | 'helldivers2' | '2xko'

interface TierRow {
  tier: string
  color: string
  champions: { name: string; winrate: string; pick: string; role: string }[]
}

interface SidebarSection {
  id: string
  label: string
  icon: typeof Swords
}

interface NavGameItem {
  id: GameId
  name: string
  shortName: string
  icon: typeof Swords
  dotColor: string
  badge?: { text: string; color: string; bgColor: string }
}

interface Game {
  id: GameId
  name: string
  shortName: string
  tagline: string
  badge?: { text: string; color: string }
  image?: string
  gradientBg: string
  accentColor: string
  accentHover: string
  icon: typeof Swords
  iconColor: string
  tierList?: TierRow[]
  features: { title: string; stat: string; sub: string }[]
  isComingSoon?: boolean
}

/* ────────────────────────────────────
   NAV GAMES (top navbar – 8 games)
   ──────────────────────────────────── */

const NAV_GAMES: NavGameItem[] = [
  { id: 'lol', name: 'League of Legends', shortName: 'LoL', icon: Swords, dotColor: 'bg-emerald-400', badge: { text: 'HOT', color: 'text-white', bgColor: 'bg-red-500' } },
  { id: 'valorant', name: 'Valorant', shortName: 'VAL', icon: Crosshair, dotColor: 'bg-red-400' },
  { id: 'rematch', name: 'Rematch', shortName: 'RM', icon: RotateCcw, dotColor: 'bg-green-400' },
  { id: 'tft', name: 'Teamfight Tactics', shortName: 'TFT', icon: Crown, dotColor: 'bg-amber-400' },
  { id: 'deadlock', name: 'Deadlock', shortName: 'DL', icon: Zap, dotColor: 'bg-violet-400', badge: { text: 'NEW', color: 'text-white', bgColor: 'bg-violet-500' } },
  { id: 'wow', name: 'World of Warcraft', shortName: 'WoW', icon: Shield, dotColor: 'bg-purple-400' },
  { id: 'helldivers2', name: 'Helldivers 2', shortName: 'HD2', icon: Rocket, dotColor: 'bg-orange-400' },
  { id: '2xko', name: '2XKO', shortName: '2XKO', icon: Swords, dotColor: 'bg-rose-400', badge: { text: 'SOON™', color: 'text-white', bgColor: 'bg-rose-500' } },
]

/* ────────────────────────────────────
   SIDEBAR SECTIONS (per game)
   ──────────────────────────────────── */

const SIDEBAR_SECTIONS: Record<GameId, SidebarSection[]> = {
  lol: [
    { id: 'home', label: 'Home', icon: LayoutDashboard },
    { id: 'champions', label: 'Champions', icon: Swords },
    { id: 'builds', label: 'Builds', icon: Wrench },
    { id: 'runes', label: 'Runes', icon: Sparkles },
    { id: 'counters', label: 'Counters', icon: Target },
    { id: 'pro-builds', label: 'Pro Builds', icon: Star },
    { id: 'tier-list', label: 'Tier List', icon: TrendingUp },
    { id: 'leaderboards', label: 'Leaderboards', icon: Trophy },
    { id: 'live-game', label: 'Live Game', icon: Eye },
  ],
  valorant: [
    { id: 'home', label: 'Home', icon: LayoutDashboard },
    { id: 'agents', label: 'Agents', icon: Users },
    { id: 'builds', label: 'Builds', icon: Wrench },
    { id: 'abilities', label: 'Abilities', icon: Sparkles },
    { id: 'counters', label: 'Counters', icon: Target },
    { id: 'tier-list', label: 'Tier List', icon: TrendingUp },
    { id: 'leaderboards', label: 'Leaderboards', icon: Trophy },
    { id: 'live-game', label: 'Live Game', icon: Eye },
  ],
  rematch: [
    { id: 'home', label: 'Home', icon: LayoutDashboard },
    { id: 'champions', label: 'Fighters', icon: Swords },
    { id: 'builds', label: 'Builds', icon: Wrench },
    { id: 'runes', label: 'Perks', icon: Sparkles },
    { id: 'counters', label: 'Counters', icon: Target },
    { id: 'tier-list', label: 'Tier List', icon: TrendingUp },
    { id: 'leaderboards', label: 'Leaderboards', icon: Trophy },
    { id: 'live-game', label: 'Live Match', icon: Eye },
  ],
  tft: [
    { id: 'home', label: 'Home', icon: LayoutDashboard },
    { id: 'champions', label: 'Champions', icon: Swords },
    { id: 'comps', label: 'Comps', icon: Wrench },
    { id: 'augments', label: 'Augments', icon: Sparkles },
    { id: 'traits', label: 'Traits', icon: Target },
    { id: 'tier-list', label: 'Tier List', icon: TrendingUp },
    { id: 'leaderboards', label: 'Leaderboards', icon: Trophy },
    { id: 'live-game', label: 'Live Game', icon: Eye },
  ],
  deadlock: [
    { id: 'home', label: 'Home', icon: LayoutDashboard },
    { id: 'heroes', label: 'Heroes', icon: Swords },
    { id: 'builds', label: 'Builds', icon: Wrench },
    { id: 'abilities', label: 'Abilities', icon: Sparkles },
    { id: 'counters', label: 'Counters', icon: Target },
    { id: 'tier-list', label: 'Tier List', icon: TrendingUp },
    { id: 'leaderboards', label: 'Leaderboards', icon: Trophy },
    { id: 'live-game', label: 'Live Game', icon: Eye },
  ],
  wow: [
    { id: 'home', label: 'Home', icon: LayoutDashboard },
    { id: 'classes', label: 'Classes', icon: Swords },
    { id: 'builds', label: 'Builds', icon: Wrench },
    { id: 'talents', label: 'Talents', icon: Sparkles },
    { id: 'encounters', label: 'Encounters', icon: Target },
    { id: 'tier-list', label: 'Tier List', icon: TrendingUp },
    { id: 'leaderboards', label: 'Leaderboards', icon: Trophy },
    { id: 'live-game', label: 'Live Game', icon: Eye },
  ],
  helldivers2: [
    { id: 'home', label: 'Home', icon: LayoutDashboard },
    { id: 'weapons', label: 'Weapons', icon: Swords },
    { id: 'stratagems', label: 'Stratagems', icon: Wrench },
    { id: 'perks', label: 'Perks', icon: Sparkles },
    { id: 'enemies', label: 'Enemies', icon: Target },
    { id: 'tier-list', label: 'Tier List', icon: TrendingUp },
    { id: 'leaderboards', label: 'Leaderboards', icon: Trophy },
    { id: 'live-game', label: 'Live Game', icon: Eye },
  ],
  '2xko': [
    { id: 'home', label: 'Home', icon: LayoutDashboard },
    { id: 'fighters', label: 'Fighters', icon: Swords },
    { id: 'combos', label: 'Combos', icon: Wrench },
    { id: 'moves', label: 'Moves', icon: Sparkles },
    { id: 'counters', label: 'Counters', icon: Target },
    { id: 'tier-list', label: 'Tier List', icon: TrendingUp },
    { id: 'leaderboards', label: 'Leaderboards', icon: Trophy },
    { id: 'live-game', label: 'Live Match', icon: Eye },
  ],
  dota2: [
    { id: 'home', label: 'Home', icon: LayoutDashboard },
    { id: 'heroes', label: 'Heroes', icon: Swords },
    { id: 'builds', label: 'Builds', icon: Wrench },
    { id: 'abilities', label: 'Abilities', icon: Sparkles },
    { id: 'counters', label: 'Counters', icon: Target },
    { id: 'tier-list', label: 'Tier List', icon: TrendingUp },
    { id: 'leaderboards', label: 'Leaderboards', icon: Trophy },
    { id: 'live-game', label: 'Live Game', icon: Eye },
  ],
}

/* ────────────────────────────────────
   GAME DATA (5 original + 4 new)
   ──────────────────────────────────── */

const GAMES: Game[] = [
  {
    id: 'lol',
    name: 'League of Legends',
    shortName: 'LoL',
    tagline: 'Builds, counters, runes y más',
    badge: { text: 'HOT', color: 'bg-red-500 text-white' },
    image: '/games/lol.png',
    gradientBg: 'from-emerald-900/40 to-emerald-600/20',
    accentColor: 'emerald',
    accentHover: 'hover:border-emerald-500/60',
    icon: Swords,
    iconColor: 'text-emerald-400',
    features: [
      { title: 'Campeones rastreados', stat: '167+', sub: 'con datos activos' },
      { title: 'Tier List actualizada', stat: '24h', sub: 'última actualización' },
      { title: 'Win Rate promedio', stat: '50.3%', sub: 'todas las rangos' },
      { title: 'Partidas analizadas', stat: '2.5M+', sub: 'este parche' },
    ],
    tierList: [
      { tier: 'S', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', champions: [
        { name: 'Aatrox', winrate: '51.8%', pick: '14.2%', role: 'Top' },
        { name: 'Jinx', winrate: '52.1%', pick: '16.8%', role: 'ADC' },
        { name: 'Orianna', winrate: '51.3%', pick: '12.5%', role: 'Mid' },
        { name: 'Lee Sin', winrate: '50.9%', pick: '11.7%', role: 'Jungle' },
      ]},
      { tier: 'A', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', champions: [
        { name: 'Garen', winrate: '50.5%', pick: '13.1%', role: 'Top' },
        { name: 'Kai\'Sa', winrate: '50.8%', pick: '15.3%', role: 'ADC' },
        { name: 'Ahri', winrate: '50.6%', pick: '10.9%', role: 'Mid' },
        { name: 'Viego', winrate: '50.2%', pick: '9.8%', role: 'Jungle' },
      ]},
      { tier: 'B', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', champions: [
        { name: 'Darius', winrate: '49.8%', pick: '11.2%', role: 'Top' },
        { name: 'Ezreal', winrate: '49.5%', pick: '14.1%', role: 'ADC' },
        { name: 'Zed', winrate: '49.2%', pick: '8.6%', role: 'Mid' },
        { name: 'Graves', winrate: '49.7%', pick: '7.3%', role: 'Jungle' },
      ]},
      { tier: 'C', color: 'bg-violet-500/20 text-violet-400 border-violet-500/30', champions: [
        { name: 'Mordekaiser', winrate: '48.5%', pick: '6.4%', role: 'Top' },
        { name: 'Draven', winrate: '48.2%', pick: '5.1%', role: 'ADC' },
        { name: 'Yasuo', winrate: '47.8%', pick: '12.3%', role: 'Mid' },
        { name: 'Ivern', winrate: '48.0%', pick: '1.9%', role: 'Jungle' },
      ]},
    ],
  },
  {
    id: 'tft',
    name: 'Teamfight Tactics',
    shortName: 'TFT',
    tagline: 'Comps, augments y posicionamiento',
    image: '/games/tft.png',
    gradientBg: 'from-amber-900/40 to-amber-600/20',
    accentColor: 'amber',
    accentHover: 'hover:border-amber-500/60',
    icon: Crown,
    iconColor: 'text-amber-400',
    features: [
      { title: 'Comps disponibles', stat: '200+', sub: 'meta y off-meta' },
      { title: 'Augments rastreados', stat: '150+', sub: 'por set actual' },
      { title: 'Top 4 Rate promedio', stat: '+12%', sub: 'usando comps óptimas' },
      { title: 'Partidas analizadas', stat: '800K+', sub: 'este set' },
    ],
    tierList: [
      { tier: 'S', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', champions: [
        { name: 'Cybernetic Bash', winrate: '31.2%', pick: '8.4%', role: 'Comp' },
        { name: 'KDA Reset', winrate: '28.9%', pick: '7.1%', role: 'Comp' },
        { name: 'Pentakill', winrate: '29.5%', pick: '9.2%', role: 'Comp' },
        { name: 'Edgelord', winrate: '27.8%', pick: '6.8%', role: 'Comp' },
      ]},
      { tier: 'A', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', champions: [
        { name: 'Bruiser', winrate: '25.1%', pick: '10.3%', role: 'Comp' },
        { name: 'Syndicate', winrate: '24.8%', pick: '8.7%', role: 'Comp' },
        { name: 'Academy', winrate: '25.5%', pick: '7.5%', role: 'Comp' },
        { name: 'Innovator', winrate: '23.9%', pick: '5.9%', role: 'Comp' },
      ]},
      { tier: 'B', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', champions: [
        { name: 'Mutant', winrate: '22.1%', pick: '6.2%', role: 'Comp' },
        { name: 'Socialite', winrate: '21.8%', pick: '5.4%', role: 'Comp' },
        { name: 'Twinshot', winrate: '22.5%', pick: '7.8%', role: 'Comp' },
        { name: 'Sniper', winrate: '21.2%', pick: '4.3%', role: 'Comp' },
      ]},
      { tier: 'C', color: 'bg-violet-500/20 text-violet-400 border-violet-500/30', champions: [
        { name: 'Renegade', winrate: '19.5%', pick: '3.8%', role: 'Comp' },
        { name: 'Scrap', winrate: '18.9%', pick: '3.1%', role: 'Comp' },
        { name: 'Arcanist', winrate: '19.2%', pick: '4.5%', role: 'Comp' },
        { name: 'Chem-Baron', winrate: '18.5%', pick: '2.7%', role: 'Comp' },
      ]},
    ],
  },
  {
    id: 'valorant',
    name: 'Valorant',
    shortName: 'VAL',
    tagline: 'Agentes, mapas y estrategias',
    image: '/games/valorant.png',
    gradientBg: 'from-red-900/40 to-red-600/20',
    accentColor: 'red',
    accentHover: 'hover:border-red-500/60',
    icon: Crosshair,
    iconColor: 'text-red-400',
    features: [
      { title: 'Agentes rastreados', stat: '25+', sub: 'con guías activas' },
      { title: 'Mapas activos', stat: '14', sub: 'pool competitivo' },
      { title: 'Win Rate promedio', stat: '51.1%', sub: 'rango Diamond+' },
      { title: 'Partidas analizadas', stat: '1.2M+', sub: 'esta temporada' },
    ],
    tierList: [
      { tier: 'S', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', champions: [
        { name: 'Jett', winrate: '52.4%', pick: '18.2%', role: 'Duelist' },
        { name: 'Omen', winrate: '51.8%', pick: '15.5%', role: 'Controller' },
        { name: 'Killjoy', winrate: '51.5%', pick: '14.1%', role: 'Sentinel' },
        { name: 'Sova', winrate: '51.2%', pick: '12.8%', role: 'Initiator' },
      ]},
      { tier: 'A', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', champions: [
        { name: 'Reyna', winrate: '50.8%', pick: '16.9%', role: 'Duelist' },
        { name: 'Brimstone', winrate: '50.5%', pick: '11.3%', role: 'Controller' },
        { name: 'Cypher', winrate: '50.3%', pick: '9.7%', role: 'Sentinel' },
        { name: 'Fade', winrate: '50.1%', pick: '10.5%', role: 'Initiator' },
      ]},
      { tier: 'B', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', champions: [
        { name: 'Raze', winrate: '49.5%', pick: '13.2%', role: 'Duelist' },
        { name: 'Astra', winrate: '49.2%', pick: '7.8%', role: 'Controller' },
        { name: 'Chamber', winrate: '49.0%', pick: '8.5%', role: 'Sentinel' },
        { name: 'Gekko', winrate: '48.8%', pick: '6.1%', role: 'Initiator' },
      ]},
      { tier: 'C', color: 'bg-violet-500/20 text-violet-400 border-violet-500/30', champions: [
        { name: 'Phoenix', winrate: '48.2%', pick: '5.9%', role: 'Duelist' },
        { name: 'Harbor', winrate: '47.9%', pick: '3.4%', role: 'Controller' },
        { name: 'Deadlock', winrate: '47.5%', pick: '2.8%', role: 'Sentinel' },
        { name: 'Kayo', winrate: '47.8%', pick: '5.2%', role: 'Initiator' },
      ]},
    ],
  },
  {
    id: 'deadlock',
    name: 'Deadlock',
    shortName: 'DL',
    tagline: 'Héroes, items y metajuego',
    badge: { text: 'NEW', color: 'bg-blue-500 text-white' },
    image: '/games/deadlock.png',
    gradientBg: 'from-violet-900/40 to-violet-600/20',
    accentColor: 'violet',
    accentHover: 'hover:border-violet-500/60',
    icon: Zap,
    iconColor: 'text-violet-400',
    features: [
      { title: 'Héroes disponibles', stat: '30+', sub: 'con builds activas' },
      { title: 'Guías de heroes', stat: '500+', sub: 'creadas por la comunidad' },
      { title: 'Win Rate promedio', stat: '50.8%', sub: 'rango Ascendant+' },
      { title: 'Partidas analizadas', stat: '300K+', sub: 'datos creciendo' },
    ],
    tierList: [
      { tier: 'S', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', champions: [
        { name: 'Seven', winrate: '53.1%', pick: '22.5%', role: 'Carry' },
        { name: 'Abrams', winrate: '52.8%', pick: '18.1%', role: 'Tank' },
        { name: 'Viscous', winrate: '52.2%', pick: '15.3%', role: 'Support' },
        { name: 'Dynamo', winrate: '51.9%', pick: '12.7%', role: 'Initiator' },
      ]},
      { tier: 'A', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', champions: [
        { name: 'Grey Talon', winrate: '51.2%', pick: '14.8%', role: 'Carry' },
        { name: 'Ksenia', winrate: '50.9%', pick: '11.2%', role: 'Flex' },
        { name: 'Mo & Krill', winrate: '50.6%', pick: '9.8%', role: 'Support' },
        { name: 'Wraith', winrate: '50.3%', pick: '10.5%', role: 'Assassin' },
      ]},
      { tier: 'B', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', champions: [
        { name: 'Lash', winrate: '49.8%', pick: '13.5%', role: 'Fighter' },
        { name: 'Bebop', winrate: '49.5%', pick: '11.9%', role: 'Support' },
        { name: 'Mirage', winrate: '49.2%', pick: '8.4%', role: 'Flex' },
        { name: 'McGinnis', winrate: '49.0%', pick: '7.6%', role: 'Tank' },
      ]},
      { tier: 'C', color: 'bg-violet-500/20 text-violet-400 border-violet-500/30', champions: [
        { name: 'Haze', winrate: '48.2%', pick: '6.1%', role: 'Assassin' },
        { name: 'Ivy', winrate: '47.9%', pick: '5.5%', role: 'Support' },
        { name: 'Pocket', winrate: '47.5%', pick: '4.2%', role: 'Support' },
        { name: 'Shiv', winrate: '47.8%', pick: '5.8%', role: 'Carry' },
      ]},
    ],
  },
  {
    id: 'dota2',
    name: 'Dota 2',
    shortName: 'DOTA',
    tagline: 'Héroes, drafts y estrategias',
    image: '/games/dota2.png',
    gradientBg: 'from-rose-900/40 to-rose-600/20',
    accentColor: 'rose',
    accentHover: 'hover:border-rose-500/60',
    icon: Shield,
    iconColor: 'text-rose-400',
    features: [
      { title: 'Héroes disponibles', stat: '124+', sub: 'todos con datos' },
      { title: 'Drafts analizados', stat: '10K+', sub: 'partidas pro' },
      { title: 'Win Rate promedio', stat: '50.5%', sub: 'rango Divine+' },
      { title: 'Partidas analizadas', stat: '1.8M+', sub: 'este parche' },
    ],
    tierList: [
      { tier: 'S', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', champions: [
        { name: 'Pudge', winrate: '53.2%', pick: '25.1%', role: 'Offlane' },
        { name: 'Faceless Void', winrate: '52.8%', pick: '18.5%', role: 'Carry' },
        { name: 'Earth Spirit', winrate: '52.5%', pick: '14.2%', role: 'Offlane' },
        { name: 'Lion', winrate: '52.1%', pick: '16.8%', role: 'Support' },
      ]},
      { tier: 'A', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', champions: [
        { name: 'Anti-Mage', winrate: '51.5%', pick: '12.3%', role: 'Carry' },
        { name: 'Tidehunter', winrate: '51.2%', pick: '11.8%', role: 'Offlane' },
        { name: 'Ogre Magi', winrate: '50.9%', pick: '10.5%', role: 'Support' },
        { name: 'Snapfire', winrate: '50.6%', pick: '9.2%', role: 'Support' },
      ]},
      { tier: 'B', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', champions: [
        { name: 'Juggernaut', winrate: '49.8%', pick: '14.5%', role: 'Carry' },
        { name: 'Sand King', winrate: '49.5%', pick: '8.9%', role: 'Offlane' },
        { name: 'Crystal Maiden', winrate: '49.2%', pick: '9.7%', role: 'Support' },
        { name: 'Undying', winrate: '49.0%', pick: '7.3%', role: 'Offlane' },
      ]},
      { tier: 'C', color: 'bg-violet-500/20 text-violet-400 border-violet-500/30', champions: [
        { name: 'Huskar', winrate: '48.5%', pick: '6.8%', role: 'Carry' },
        { name: 'Necrophos', winrate: '48.2%', pick: '5.4%', role: 'Mid' },
        { name: 'Spirit Breaker', winrate: '47.9%', pick: '4.1%', role: 'Support' },
        { name: 'Arc Warden', winrate: '47.5%', pick: '2.3%', role: 'Mid' },
      ]},
    ],
  },
  /* ── New / Coming Soon Games ── */
  {
    id: 'rematch',
    name: 'Rematch',
    shortName: 'RM',
    tagline: 'Revive el clásico RPG competitivo',
    image: undefined,
    gradientBg: 'from-green-900/40 to-green-600/20',
    accentColor: 'green',
    accentHover: 'hover:border-green-500/60',
    icon: RotateCcw,
    iconColor: 'text-green-400',
    isComingSoon: true,
    features: [
      { title: 'Clases disponibles', stat: '12+', sub: 'datos iniciales' },
      { title: 'Builds comunitarios', stat: '50+', sub: 'en desarrollo' },
      { title: 'Habilidades rastreadas', stat: '200+', sub: 'por clase' },
      { title: 'Matchups analizados', stat: 'Pronto', sub: 'pvp data' },
    ],
  },
  {
    id: 'wow',
    name: 'World of Warcraft',
    shortName: 'WoW',
    tagline: 'Raids, Mythic+ y PvP analytics',
    image: undefined,
    gradientBg: 'from-purple-900/40 to-purple-600/20',
    accentColor: 'purple',
    accentHover: 'hover:border-purple-500/60',
    icon: Shield,
    iconColor: 'text-purple-400',
    isComingSoon: true,
    features: [
      { title: 'Clases rastreadas', stat: '13', sub: 'todas las especializaciones' },
      { title: 'Dungeons Mythic+', stat: '12', sub: 'mapeo completo' },
      { title: 'Raids activos', stat: '8', sub: 'The War Within' },
      { title: 'Talent builds', stat: '60+', sub: 'por especialización' },
    ],
  },
  {
    id: 'helldivers2',
    name: 'Helldivers 2',
    shortName: 'HD2',
    tagline: 'Armas, stratagems y misiones',
    image: undefined,
    gradientBg: 'from-orange-900/40 to-orange-600/20',
    accentColor: 'orange',
    accentHover: 'hover:border-orange-500/60',
    icon: Rocket,
    iconColor: 'text-orange-400',
    isComingSoon: true,
    features: [
      { title: 'Armas catalogadas', stat: '80+', sub: 'con estadísticas' },
      { title: 'Stratagems', stat: '40+', sub: 'tier list y loadouts' },
      { title: 'Enemigos analizados', stat: '35+', sub: 'debilidades y stats' },
      { title: 'Misiones', stat: '12', sub: 'operaciones activas' },
    ],
  },
  {
    id: '2xko',
    name: '2XKO',
    shortName: '2XKO',
    tagline: 'Combos, tiers y matchup data',
    image: undefined,
    gradientBg: 'from-rose-900/40 to-rose-600/20',
    accentColor: 'rose',
    accentHover: 'hover:border-rose-500/60',
    icon: Swords,
    iconColor: 'text-rose-400',
    isComingSoon: true,
    features: [
      { title: 'Fighters disponibles', stat: '20+', sub: 'datos iniciales' },
      { title: 'Frame data', stat: 'En desarrollo', sub: 'próximamente' },
      { title: 'Combos documentados', stat: '100+', sub: 'por luchador' },
      { title: 'Matchup charts', stat: 'Pronto', sub: 'pvp analysis' },
    ],
  },
]

/* ────────────────────────────────────
   LOL CHAMPION DATA
   ──────────────────────────────────── */

type LoLRole = 'Top' | 'Jungle' | 'Mid' | 'ADC' | 'Support'

interface LoLChampion {
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

const LOL_ROLES: { id: LoLRole | 'All'; label: string; color: string; bgColor: string }[] = [
  { id: 'All', label: 'Todos', color: 'text-foreground', bgColor: 'bg-white/10' },
  { id: 'Top', label: 'Top', color: 'text-orange-400', bgColor: 'bg-orange-500/10 border-orange-500/30' },
  { id: 'Jungle', label: 'Jungle', color: 'text-green-400', bgColor: 'bg-green-500/10 border-green-500/30' },
  { id: 'Mid', label: 'Mid', color: 'text-cyan-400', bgColor: 'bg-cyan-500/10 border-cyan-500/30' },
  { id: 'ADC', label: 'ADC', color: 'text-red-400', bgColor: 'bg-red-500/10 border-red-500/30' },
  { id: 'Support', label: 'Support', color: 'text-yellow-400', bgColor: 'bg-yellow-500/10 border-yellow-500/30' },
]

const ROLE_COLORS: Record<LoLRole, { text: string; bg: string; border: string; dot: string }> = {
  Top: { text: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30', dot: 'bg-orange-400' },
  Jungle: { text: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30', dot: 'bg-green-400' },
  Mid: { text: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', dot: 'bg-cyan-400' },
  ADC: { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', dot: 'bg-red-400' },
  Support: { text: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', dot: 'bg-yellow-400' },
}

const TIER_STYLES: Record<string, { text: string; bg: string; border: string }> = {
  S: { text: 'text-yellow-400', bg: 'bg-yellow-500/15', border: 'border-yellow-500/30' },
  A: { text: 'text-emerald-400', bg: 'bg-emerald-500/15', border: 'border-emerald-500/30' },
  B: { text: 'text-blue-400', bg: 'bg-blue-500/15', border: 'border-blue-500/30' },
  C: { text: 'text-violet-400', bg: 'bg-violet-500/15', border: 'border-violet-500/30' },
}

const LOL_CHAMPIONS: LoLChampion[] = [
  // Top
  { name: 'Aatrox', role: 'Top', winrate: 51.8, pickrate: 14.2, banrate: 8.1, tier: 'S', trend: 'up', trendChange: 0.5, games: 245000 },
  { name: 'Garen', role: 'Top', winrate: 50.5, pickrate: 13.1, banrate: 1.2, tier: 'A', trend: 'stable', trendChange: 0.1, games: 198000 },
  { name: 'Darius', role: 'Top', winrate: 49.8, pickrate: 11.2, banrate: 3.5, tier: 'B', trend: 'down', trendChange: -0.3, games: 172000 },
  { name: 'K\'Sante', role: 'Top', winrate: 51.2, pickrate: 9.8, banrate: 4.2, tier: 'A', trend: 'up', trendChange: 0.7, games: 156000 },
  { name: 'Mordekaiser', role: 'Top', winrate: 48.5, pickrate: 6.4, banrate: 2.1, tier: 'C', trend: 'down', trendChange: -0.8, games: 98000 },
  // Jungle
  { name: 'Lee Sin', role: 'Jungle', winrate: 50.9, pickrate: 11.7, banrate: 5.5, tier: 'S', trend: 'stable', trendChange: 0.2, games: 210000 },
  { name: 'Viego', role: 'Jungle', winrate: 50.2, pickrate: 9.8, banrate: 6.8, tier: 'A', trend: 'up', trendChange: 0.4, games: 178000 },
  { name: 'Graves', role: 'Jungle', winrate: 49.7, pickrate: 7.3, banrate: 1.5, tier: 'B', trend: 'down', trendChange: -0.2, games: 132000 },
  { name: 'Jarvan IV', role: 'Jungle', winrate: 51.1, pickrate: 8.9, banrate: 3.2, tier: 'A', trend: 'up', trendChange: 0.6, games: 165000 },
  { name: 'Rek\'Sai', role: 'Jungle', winrate: 50.5, pickrate: 5.4, banrate: 0.8, tier: 'B', trend: 'stable', trendChange: 0.0, games: 98000 },
  // Mid
  { name: 'Orianna', role: 'Mid', winrate: 51.3, pickrate: 12.5, banrate: 2.3, tier: 'S', trend: 'up', trendChange: 0.3, games: 220000 },
  { name: 'Ahri', role: 'Mid', winrate: 50.6, pickrate: 10.9, banrate: 1.8, tier: 'A', trend: 'stable', trendChange: 0.1, games: 192000 },
  { name: 'Zed', role: 'Mid', winrate: 49.2, pickrate: 8.6, banrate: 2.5, tier: 'B', trend: 'down', trendChange: -0.5, games: 148000 },
  { name: 'Syndra', role: 'Mid', winrate: 51.5, pickrate: 7.8, banrate: 1.2, tier: 'A', trend: 'up', trendChange: 0.8, games: 135000 },
  { name: 'Yasuo', role: 'Mid', winrate: 47.8, pickrate: 12.3, banrate: 7.9, tier: 'C', trend: 'down', trendChange: -0.6, games: 215000 },
  // ADC
  { name: 'Jinx', role: 'ADC', winrate: 52.1, pickrate: 16.8, banrate: 9.2, tier: 'S', trend: 'up', trendChange: 0.4, games: 280000 },
  { name: 'Kai\'Sa', role: 'ADC', winrate: 50.8, pickrate: 15.3, banrate: 5.1, tier: 'A', trend: 'stable', trendChange: 0.1, games: 262000 },
  { name: 'Draven', role: 'ADC', winrate: 48.2, pickrate: 5.1, banrate: 0.9, tier: 'C', trend: 'down', trendChange: -0.4, games: 89000 },
  { name: 'Ezreal', role: 'ADC', winrate: 49.5, pickrate: 14.1, banrate: 2.2, tier: 'B', trend: 'stable', trendChange: 0.0, games: 245000 },
  { name: 'Aphelios', role: 'ADC', winrate: 51.6, pickrate: 6.7, banrate: 3.1, tier: 'A', trend: 'up', trendChange: 0.9, games: 118000 },
  // Support
  { name: 'Thresh', role: 'Support', winrate: 50.4, pickrate: 15.8, banrate: 2.8, tier: 'A', trend: 'stable', trendChange: 0.0, games: 275000 },
  { name: 'Nautilus', role: 'Support', winrate: 51.0, pickrate: 12.2, banrate: 3.5, tier: 'S', trend: 'up', trendChange: 0.3, games: 210000 },
  { name: 'Lulu', role: 'Support', winrate: 50.1, pickrate: 9.5, banrate: 1.1, tier: 'A', trend: 'down', trendChange: -0.2, games: 168000 },
  { name: 'Janna', role: 'Support', winrate: 49.8, pickrate: 7.2, banrate: 0.4, tier: 'B', trend: 'stable', trendChange: 0.1, games: 125000 },
  { name: 'Yuumi', role: 'Support', winrate: 48.5, pickrate: 4.8, banrate: 12.1, tier: 'C', trend: 'down', trendChange: -0.7, games: 82000 },
]

const LOL_PRO_BUILDS = [
  { player: 'Faker', team: 'T1', champion: 'Orianna', role: 'Mid', winrate: 58.2, games: 45, items: ['Morellonomicon', 'Rabadon\'s Deathcap', 'Void Staff', 'Zhonya\'s Hourglass', 'Rylai\'s Crystal Scepter', 'Ionian Boots'] },
  { player: 'Ruler', team: 'Gen.G', champion: 'Jinx', role: 'ADC', winrate: 56.8, games: 42, items: ['Immortal Shieldbow', 'Infinity Edge', 'Lord Dominik\'s Regards', 'Phantom Dancer', 'Bloodthirster', 'Berserker\'s Greaves'] },
  { player: 'Zeus', team: 'T1', champion: 'Aatrox', role: 'Top', winrate: 55.1, games: 38, items: ['Sundered Sky', 'Black Cleaver', 'Sterak\'s Gage', 'Death\'s Dance', 'Thornmail', 'Plated Steelcaps'] },
  { player: 'Canyon', team: 'Gen.G', champion: 'Lee Sin', role: 'Jungle', winrate: 57.3, games: 41, items: ['Prowler\'s Claw', 'Black Cleaver', 'Serylda\'s Grudge', 'Edge of Night', 'Death\'s Dance', 'Sorcerer\'s Shoes'] },
  { player: 'Keria', team: 'T1', champion: 'Thresh', role: 'Support', winrate: 54.9, games: 44, items: ['Locket of the Iron Solari', 'Redemption', 'Knight\'s Vow', 'Dead Man\'s Plate', 'Ardent Censer', 'Boots of Speed'] },
  { player: 'Chovy', team: 'Gen.G', champion: 'Ahri', role: 'Mid', winrate: 59.1, games: 36, items: ['Lich Bane', 'Rabadon\'s Deathcap', 'Void Staff', 'Horizon Focus', 'Cosmic Drive', 'Sorcerer\'s Shoes'] },
]

const LOL_ITEMS = [
  { name: 'Sundered Sky', gold: 3100 },
  { name: 'Black Cleaver', gold: 3000 },
  { name: 'Sterak\'s Gage', gold: 3100 },
  { name: 'Death\'s Dance', gold: 3100 },
  { name: 'Thornmail', gold: 2700 },
  { name: 'Plated Steelcaps', gold: 1100 },
]

/* ────────────────────────────────────
   ACCENT COLOR MAP (for game theming)
   ──────────────────────────────────── */

const ACCENT_MAP: Record<string, { primary: string; hover: string; bg: string; text: string; border: string; gradient: string; button: string; buttonHover: string }> = {
  red: { primary: 'bg-red-500', hover: 'hover:bg-red-400', bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30', gradient: 'from-red-500/20 to-red-600/5', button: 'bg-red-500', buttonHover: 'hover:bg-red-400' },
  amber: { primary: 'bg-amber-500', hover: 'hover:bg-amber-400', bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30', gradient: 'from-amber-500/20 to-amber-600/5', button: 'bg-amber-500', buttonHover: 'hover:bg-amber-400' },
  violet: { primary: 'bg-violet-500', hover: 'hover:bg-violet-400', bg: 'bg-violet-500/10', text: 'text-violet-400', border: 'border-violet-500/30', gradient: 'from-violet-500/20 to-violet-600/5', button: 'bg-violet-500', buttonHover: 'hover:bg-violet-400' },
  rose: { primary: 'bg-rose-500', hover: 'hover:bg-rose-400', bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/30', gradient: 'from-rose-500/20 to-rose-600/5', button: 'bg-rose-500', buttonHover: 'hover:bg-rose-400' },
  emerald: { primary: 'bg-emerald-500', hover: 'hover:bg-emerald-400', bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30', gradient: 'from-emerald-500/20 to-emerald-600/5', button: 'bg-emerald-500', buttonHover: 'hover:bg-emerald-400' },
  purple: { primary: 'bg-purple-500', hover: 'hover:bg-purple-400', bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30', gradient: 'from-purple-500/20 to-purple-600/5', button: 'bg-purple-500', buttonHover: 'hover:bg-purple-400' },
  orange: { primary: 'bg-orange-500', hover: 'hover:bg-orange-400', bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/30', gradient: 'from-orange-500/20 to-orange-600/5', button: 'bg-orange-500', buttonHover: 'hover:bg-orange-400' },
  green: { primary: 'bg-green-500', hover: 'hover:bg-green-400', bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/30', gradient: 'from-green-500/20 to-green-600/5', button: 'bg-green-500', buttonHover: 'hover:bg-green-400' },
}

/* ────────────────────────────────────
   VALORANT AGENT DATA
   ──────────────────────────────────── */

type ValRole = 'Duelist' | 'Controller' | 'Sentinel' | 'Initiator'

const VAL_ROLES_DEF = [
  { id: 'All', label: 'All', color: 'text-foreground', bgColor: 'bg-white/10', dotColor: '' },
  { id: 'Duelist', label: 'Duelist', color: 'text-red-400', bgColor: 'bg-red-500/10', borderColor: 'border-red-500/30', dotColor: 'bg-red-400' },
  { id: 'Controller', label: 'Controller', color: 'text-purple-400', bgColor: 'bg-purple-500/10', borderColor: 'border-purple-500/30', dotColor: 'bg-purple-400' },
  { id: 'Sentinel', label: 'Sentinel', color: 'text-green-400', bgColor: 'bg-green-500/10', borderColor: 'border-green-500/30', dotColor: 'bg-green-400' },
  { id: 'Initiator', label: 'Initiator', color: 'text-cyan-400', bgColor: 'bg-cyan-500/10', borderColor: 'border-cyan-500/30', dotColor: 'bg-cyan-400' },
]

const VAL_ROLE_COLORS: Record<ValRole, { text: string; bg: string; border: string; dot: string }> = {
  Duelist: { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', dot: 'bg-red-400' },
  Controller: { text: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30', dot: 'bg-purple-400' },
  Sentinel: { text: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30', dot: 'bg-green-400' },
  Initiator: { text: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', dot: 'bg-cyan-400' },
}

const VALORANT_AGENTS = [
  { name: 'Jett', role: 'Duelist' as ValRole, winrate: 52.4, pickrate: 18.2, banrate: 3.1, tier: 'S' as const, trend: 'up' as const, trendChange: 0.8, kda: 1.2 },
  { name: 'Reyna', role: 'Duelist' as ValRole, winrate: 50.8, pickrate: 16.9, banrate: 2.5, tier: 'A' as const, trend: 'stable' as const, trendChange: 0.1, kda: 1.4 },
  { name: 'Raze', role: 'Duelist' as ValRole, winrate: 49.5, pickrate: 13.2, banrate: 0.8, tier: 'B' as const, trend: 'down' as const, trendChange: -0.3, kda: 1.1 },
  { name: 'Phoenix', role: 'Duelist' as ValRole, winrate: 48.2, pickrate: 5.9, banrate: 0.3, tier: 'C' as const, trend: 'down' as const, trendChange: -0.5, kda: 0.9 },
  { name: 'Iso', role: 'Duelist' as ValRole, winrate: 51.1, pickrate: 8.4, banrate: 1.2, tier: 'A' as const, trend: 'up' as const, trendChange: 0.6, kda: 1.1 },
  { name: 'Omen', role: 'Controller' as ValRole, winrate: 51.8, pickrate: 15.5, banrate: 1.8, tier: 'S' as const, trend: 'up' as const, trendChange: 0.4, kda: 0.8 },
  { name: 'Brimstone', role: 'Controller' as ValRole, winrate: 50.5, pickrate: 11.3, banrate: 0.9, tier: 'A' as const, trend: 'stable' as const, trendChange: 0.0, kda: 0.7 },
  { name: 'Astra', role: 'Controller' as ValRole, winrate: 49.2, pickrate: 7.8, banrate: 0.5, tier: 'B' as const, trend: 'down' as const, trendChange: -0.4, kda: 0.6 },
  { name: 'Harbor', role: 'Controller' as ValRole, winrate: 47.9, pickrate: 3.4, banrate: 0.2, tier: 'C' as const, trend: 'stable' as const, trendChange: 0.0, kda: 0.5 },
  { name: 'Clove', role: 'Controller' as ValRole, winrate: 50.9, pickrate: 9.1, banrate: 1.1, tier: 'A' as const, trend: 'up' as const, trendChange: 0.7, kda: 0.9 },
  { name: 'Killjoy', role: 'Sentinel' as ValRole, winrate: 51.5, pickrate: 14.1, banrate: 2.2, tier: 'S' as const, trend: 'stable' as const, trendChange: 0.2, kda: 0.9 },
  { name: 'Cypher', role: 'Sentinel' as ValRole, winrate: 50.3, pickrate: 9.7, banrate: 1.5, tier: 'A' as const, trend: 'up' as const, trendChange: 0.3, kda: 0.8 },
  { name: 'Chamber', role: 'Sentinel' as ValRole, winrate: 49.0, pickrate: 8.5, banrate: 1.0, tier: 'B' as const, trend: 'down' as const, trendChange: -0.6, kda: 1.0 },
  { name: 'Deadlock', role: 'Sentinel' as ValRole, winrate: 47.5, pickrate: 2.8, banrate: 0.1, tier: 'C' as const, trend: 'down' as const, trendChange: -0.7, kda: 0.6 },
  { name: 'Sova', role: 'Initiator' as ValRole, winrate: 51.2, pickrate: 12.8, banrate: 1.6, tier: 'S' as const, trend: 'up' as const, trendChange: 0.5, kda: 0.9 },
  { name: 'Fade', role: 'Initiator' as ValRole, winrate: 50.1, pickrate: 10.5, banrate: 1.3, tier: 'A' as const, trend: 'stable' as const, trendChange: 0.1, kda: 0.8 },
  { name: 'Gekko', role: 'Initiator' as ValRole, winrate: 48.8, pickrate: 6.1, banrate: 0.4, tier: 'B' as const, trend: 'up' as const, trendChange: 0.2, kda: 0.7 },
  { name: 'Kayo', role: 'Initiator' as ValRole, winrate: 47.8, pickrate: 5.2, banrate: 0.3, tier: 'C' as const, trend: 'down' as const, trendChange: -0.4, kda: 0.6 },
  { name: 'Skye', role: 'Initiator' as ValRole, winrate: 50.6, pickrate: 7.9, banrate: 0.7, tier: 'A' as const, trend: 'stable' as const, trendChange: 0.0, kda: 1.1 },
  { name: 'Vyse', role: 'Sentinel' as ValRole, winrate: 51.3, pickrate: 11.2, banrate: 2.8, tier: 'S' as const, trend: 'up' as const, trendChange: 1.1, kda: 0.9 },
]

/* ────────────────────────────────────
   TFT COMP DATA
   ──────────────────────────────────── */

const TFT_COST_ROLES_DEF = [
  { id: 'All', label: 'All', color: 'text-foreground', bgColor: 'bg-white/10', dotColor: '' },
  { id: '1', label: '$1 Easy', color: 'text-gray-400', bgColor: 'bg-gray-500/10', borderColor: 'border-gray-500/30', dotColor: 'bg-gray-400' },
  { id: '2', label: '$2 Easy', color: 'text-green-400', bgColor: 'bg-green-500/10', borderColor: 'border-green-500/30', dotColor: 'bg-green-400' },
  { id: '3', label: '$3 Medium', color: 'text-cyan-400', bgColor: 'bg-cyan-500/10', borderColor: 'border-cyan-500/30', dotColor: 'bg-cyan-400' },
  { id: '4', label: '$4 Hard', color: 'text-violet-400', bgColor: 'bg-violet-500/10', borderColor: 'border-violet-500/30', dotColor: 'bg-violet-400' },
  { id: '5', label: '$5 Hard', color: 'text-amber-400', bgColor: 'bg-amber-500/10', borderColor: 'border-amber-500/30', dotColor: 'bg-amber-400' },
]

const TFT_COST_COLORS: Record<string, { text: string; bg: string; border: string; dot: string }> = {
  '1': { text: 'text-gray-400', bg: 'bg-gray-500/10', border: 'border-gray-500/30', dot: 'bg-gray-400' },
  '2': { text: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30', dot: 'bg-green-400' },
  '3': { text: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', dot: 'bg-cyan-400' },
  '4': { text: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/30', dot: 'bg-violet-400' },
  '5': { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', dot: 'bg-amber-400' },
}

const TFT_COMPS = [
  { name: 'Cybernetic Bash', role: '4' as const, winrate: 24.5, pickrate: 8.4, placementRate: 31.2, tier: 'S' as const, trend: 'up' as const, trendChange: 1.2, difficulty: 'Easy', carryUnits: ['Vi', 'Ezreal', 'Fiora'] },
  { name: 'KDA Reset', role: '5' as const, winrate: 23.1, pickrate: 7.1, placementRate: 28.9, tier: 'S' as const, trend: 'stable' as const, trendChange: 0.2, difficulty: 'Hard', carryUnits: ['Ahri', 'Ekko', 'Sett'] },
  { name: 'Pentakill', role: '4' as const, winrate: 22.8, pickrate: 9.2, placementRate: 29.5, tier: 'S' as const, trend: 'up' as const, trendChange: 0.5, difficulty: 'Medium', carryUnits: ['Karthus', 'Yasuo', 'Kayle'] },
  { name: 'Edgelord', role: '3' as const, winrate: 21.5, pickrate: 6.8, placementRate: 27.8, tier: 'S' as const, trend: 'up' as const, trendChange: 0.8, difficulty: 'Medium', carryUnits: ['Zed', 'Nocturne', 'Katarina'] },
  { name: 'Bruiser', role: '2' as const, winrate: 20.2, pickrate: 10.3, placementRate: 25.1, tier: 'A' as const, trend: 'stable' as const, trendChange: 0.0, difficulty: 'Easy', carryUnits: ['Darius', 'Garen', 'Warwick'] },
  { name: 'Syndicate', role: '3' as const, winrate: 19.8, pickrate: 8.7, placementRate: 24.8, tier: 'A' as const, trend: 'down' as const, trendChange: -0.3, difficulty: 'Medium', carryUnits: ['Twisted Fate', 'Viego', 'Akali'] },
  { name: 'Academy', role: '3' as const, winrate: 20.5, pickrate: 7.5, placementRate: 25.5, tier: 'A' as const, trend: 'up' as const, trendChange: 0.4, difficulty: 'Medium', carryUnits: ['Taliyah', 'Nomsy', 'Leona'] },
  { name: 'Innovator', role: '2' as const, winrate: 18.9, pickrate: 5.9, placementRate: 23.9, tier: 'A' as const, trend: 'up' as const, trendChange: 0.6, difficulty: 'Easy', carryUnits: ['Ziggs', 'Heimerdinger', 'Lulu'] },
  { name: 'Mutant', role: '1' as const, winrate: 17.2, pickrate: 6.2, placementRate: 22.1, tier: 'B' as const, trend: 'down' as const, trendChange: -0.5, difficulty: 'Easy', carryUnits: ['Twitch', 'KogMaw', 'ChoGath'] },
  { name: 'Socialite', role: '2' as const, winrate: 16.8, pickrate: 5.4, placementRate: 21.8, tier: 'B' as const, trend: 'stable' as const, trendChange: 0.1, difficulty: 'Easy', carryUnits: ['Senna', 'Neeko', 'Nami'] },
  { name: 'Twinshot', role: '1' as const, winrate: 17.5, pickrate: 7.8, placementRate: 22.5, tier: 'B' as const, trend: 'down' as const, trendChange: -0.2, difficulty: 'Easy', carryUnits: ['Varus', 'Vayne', 'Cassiopeia'] },
  { name: 'Sniper', role: '3' as const, winrate: 16.5, pickrate: 4.3, placementRate: 21.2, tier: 'B' as const, trend: 'down' as const, trendChange: -0.4, difficulty: 'Hard', carryUnits: ['Jinx', 'Ashe', 'Aphelios'] },
  { name: 'Renegade', role: '2' as const, winrate: 15.2, pickrate: 3.8, placementRate: 19.5, tier: 'C' as const, trend: 'down' as const, trendChange: -0.6, difficulty: 'Medium', carryUnits: ['Samira', 'Pyke', 'Gangplank'] },
  { name: 'Scrap', role: '1' as const, winrate: 14.5, pickrate: 3.1, placementRate: 18.9, tier: 'C' as const, trend: 'stable' as const, trendChange: 0.0, difficulty: 'Easy', carryUnits: ['Rumble', 'Tristana', 'Fizz'] },
  { name: 'Arcanist', role: '4' as const, winrate: 15.0, pickrate: 4.5, placementRate: 19.2, tier: 'C' as const, trend: 'down' as const, trendChange: -0.3, difficulty: 'Hard', carryUnits: ['Syndra', 'Veigar', 'Ryze'] },
  { name: 'Chem-Baron', role: '3' as const, winrate: 14.2, pickrate: 2.7, placementRate: 18.5, tier: 'C' as const, trend: 'stable' as const, trendChange: 0.0, difficulty: 'Medium', carryUnits: ['Singed', 'Twitch', 'Zac'] },
]

/* ────────────────────────────────────
   DEADLOCK HERO DATA
   ──────────────────────────────────── */

type DlRole = 'Carry' | 'Tank' | 'Support' | 'Flex' | 'Initiator' | 'Assassin'

const DL_ROLES_DEF = [
  { id: 'All', label: 'All', color: 'text-foreground', bgColor: 'bg-white/10', dotColor: '' },
  { id: 'Carry', label: 'Carry', color: 'text-red-400', bgColor: 'bg-red-500/10', borderColor: 'border-red-500/30', dotColor: 'bg-red-400' },
  { id: 'Tank', label: 'Tank', color: 'text-amber-400', bgColor: 'bg-amber-500/10', borderColor: 'border-amber-500/30', dotColor: 'bg-amber-400' },
  { id: 'Support', label: 'Support', color: 'text-green-400', bgColor: 'bg-green-500/10', borderColor: 'border-green-500/30', dotColor: 'bg-green-400' },
  { id: 'Flex', label: 'Flex', color: 'text-cyan-400', bgColor: 'bg-cyan-500/10', borderColor: 'border-cyan-500/30', dotColor: 'bg-cyan-400' },
  { id: 'Initiator', label: 'Initiator', color: 'text-violet-400', bgColor: 'bg-violet-500/10', borderColor: 'border-violet-500/30', dotColor: 'bg-violet-400' },
  { id: 'Assassin', label: 'Assassin', color: 'text-rose-400', bgColor: 'bg-rose-500/10', borderColor: 'border-rose-500/30', dotColor: 'bg-rose-400' },
]

const DL_ROLE_COLORS: Record<DlRole, { text: string; bg: string; border: string; dot: string }> = {
  Carry: { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', dot: 'bg-red-400' },
  Tank: { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', dot: 'bg-amber-400' },
  Support: { text: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30', dot: 'bg-green-400' },
  Flex: { text: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', dot: 'bg-cyan-400' },
  Initiator: { text: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/30', dot: 'bg-violet-400' },
  Assassin: { text: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30', dot: 'bg-rose-400' },
}

const DEADLOCK_HEROES = [
  { name: 'Seven', role: 'Carry' as DlRole, winrate: 53.1, pickrate: 22.5, tier: 'S' as const, trend: 'up' as const, trendChange: 0.9, kda: 3.2 },
  { name: 'Abrams', role: 'Tank' as DlRole, winrate: 52.8, pickrate: 18.1, tier: 'S' as const, trend: 'stable' as const, trendChange: 0.1, kda: 4.5 },
  { name: 'Viscous', role: 'Support' as DlRole, winrate: 52.2, pickrate: 15.3, tier: 'S' as const, trend: 'up' as const, trendChange: 0.5, kda: 5.1 },
  { name: 'Dynamo', role: 'Initiator' as DlRole, winrate: 51.9, pickrate: 12.7, tier: 'S' as const, trend: 'up' as const, trendChange: 0.4, kda: 3.8 },
  { name: 'Grey Talon', role: 'Carry' as DlRole, winrate: 51.2, pickrate: 14.8, tier: 'A' as const, trend: 'stable' as const, trendChange: 0.0, kda: 2.9 },
  { name: 'Ksenia', role: 'Flex' as DlRole, winrate: 50.9, pickrate: 11.2, tier: 'A' as const, trend: 'up' as const, trendChange: 0.3, kda: 3.5 },
  { name: 'Mo & Krill', role: 'Support' as DlRole, winrate: 50.6, pickrate: 9.8, tier: 'A' as const, trend: 'down' as const, trendChange: -0.2, kda: 4.8 },
  { name: 'Wraith', role: 'Assassin' as DlRole, winrate: 50.3, pickrate: 10.5, tier: 'A' as const, trend: 'stable' as const, trendChange: 0.0, kda: 2.5 },
  { name: 'Mirage', role: 'Flex' as DlRole, winrate: 50.1, pickrate: 8.4, tier: 'A' as const, trend: 'up' as const, trendChange: 0.6, kda: 3.1 },
  { name: 'Yamato', role: 'Carry' as DlRole, winrate: 50.8, pickrate: 13.1, tier: 'A' as const, trend: 'stable' as const, trendChange: 0.1, kda: 2.8 },
  { name: 'Lash', role: 'Flex' as DlRole, winrate: 49.8, pickrate: 13.5, tier: 'B' as const, trend: 'down' as const, trendChange: -0.3, kda: 2.6 },
  { name: 'Bebop', role: 'Support' as DlRole, winrate: 49.5, pickrate: 11.9, tier: 'B' as const, trend: 'stable' as const, trendChange: 0.0, kda: 4.2 },
  { name: 'McGinnis', role: 'Tank' as DlRole, winrate: 49.0, pickrate: 7.6, tier: 'B' as const, trend: 'down' as const, trendChange: -0.4, kda: 4.0 },
  { name: 'Shiv', role: 'Carry' as DlRole, winrate: 47.8, pickrate: 5.8, tier: 'C' as const, trend: 'down' as const, trendChange: -0.6, kda: 2.2 },
  { name: 'Haze', role: 'Assassin' as DlRole, winrate: 48.2, pickrate: 6.1, tier: 'C' as const, trend: 'down' as const, trendChange: -0.5, kda: 2.1 },
  { name: 'Ivy', role: 'Support' as DlRole, winrate: 47.9, pickrate: 5.5, tier: 'C' as const, trend: 'stable' as const, trendChange: 0.0, kda: 4.5 },
  { name: 'Pocket', role: 'Support' as DlRole, winrate: 47.5, pickrate: 4.2, tier: 'C' as const, trend: 'down' as const, trendChange: -0.3, kda: 5.0 },
  { name: 'Vindicta', role: 'Assassin' as DlRole, winrate: 50.5, pickrate: 7.3, tier: 'A' as const, trend: 'up' as const, trendChange: 0.7, kda: 2.8 },
  { name: 'Holliday', role: 'Carry' as DlRole, winrate: 49.2, pickrate: 9.6, tier: 'B' as const, trend: 'stable' as const, trendChange: 0.0, kda: 3.0 },
  { name: 'Patron', role: 'Tank' as DlRole, winrate: 51.5, pickrate: 10.2, tier: 'A' as const, trend: 'up' as const, trendChange: 0.5, kda: 4.3 },
]

/* ────────────────────────────────────
   DOTA 2 HERO DATA
   ──────────────────────────────────── */

type DotaRole = 'Carry' | 'Mid' | 'Offlane' | 'Support' | 'Pos 5'

const DOTA_ROLES_DEF = [
  { id: 'All', label: 'All', color: 'text-foreground', bgColor: 'bg-white/10', dotColor: '' },
  { id: 'Carry', label: 'Carry', color: 'text-red-400', bgColor: 'bg-red-500/10', borderColor: 'border-red-500/30', dotColor: 'bg-red-400' },
  { id: 'Mid', label: 'Mid', color: 'text-cyan-400', bgColor: 'bg-cyan-500/10', borderColor: 'border-cyan-500/30', dotColor: 'bg-cyan-400' },
  { id: 'Offlane', label: 'Offlane', color: 'text-orange-400', bgColor: 'bg-orange-500/10', borderColor: 'border-orange-500/30', dotColor: 'bg-orange-400' },
  { id: 'Support', label: 'Supp', color: 'text-green-400', bgColor: 'bg-green-500/10', borderColor: 'border-green-500/30', dotColor: 'bg-green-400' },
  { id: 'Pos 5', label: 'Pos 5', color: 'text-yellow-400', bgColor: 'bg-yellow-500/10', borderColor: 'border-yellow-500/30', dotColor: 'bg-yellow-400' },
]

const DOTA_ROLE_COLORS: Record<DotaRole, { text: string; bg: string; border: string; dot: string }> = {
  Carry: { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', dot: 'bg-red-400' },
  Mid: { text: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', dot: 'bg-cyan-400' },
  Offlane: { text: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30', dot: 'bg-orange-400' },
  Support: { text: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30', dot: 'bg-green-400' },
  'Pos 5': { text: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', dot: 'bg-yellow-400' },
}

const DOTA2_HEROES = [
  { name: 'Pudge', role: 'Offlane' as DotaRole, winrate: 53.2, pickrate: 25.1, banrate: 12.5, tier: 'S' as const, trend: 'up' as const, trendChange: 0.6 },
  { name: 'Faceless Void', role: 'Carry' as DotaRole, winrate: 52.8, pickrate: 18.5, banrate: 8.2, tier: 'S' as const, trend: 'up' as const, trendChange: 0.4 },
  { name: 'Earth Spirit', role: 'Offlane' as DotaRole, winrate: 52.5, pickrate: 14.2, banrate: 6.8, tier: 'S' as const, trend: 'stable' as const, trendChange: 0.1 },
  { name: 'Lion', role: 'Support' as DotaRole, winrate: 52.1, pickrate: 16.8, banrate: 4.5, tier: 'S' as const, trend: 'up' as const, trendChange: 0.3 },
  { name: 'Anti-Mage', role: 'Carry' as DotaRole, winrate: 51.5, pickrate: 12.3, banrate: 5.1, tier: 'A' as const, trend: 'stable' as const, trendChange: 0.0 },
  { name: 'Tidehunter', role: 'Offlane' as DotaRole, winrate: 51.2, pickrate: 11.8, banrate: 3.9, tier: 'A' as const, trend: 'up' as const, trendChange: 0.2 },
  { name: 'Ogre Magi', role: 'Pos 5' as DotaRole, winrate: 50.9, pickrate: 10.5, banrate: 1.2, tier: 'A' as const, trend: 'stable' as const, trendChange: 0.0 },
  { name: 'Snapfire', role: 'Support' as DotaRole, winrate: 50.6, pickrate: 9.2, banrate: 2.8, tier: 'A' as const, trend: 'up' as const, trendChange: 0.5 },
  { name: 'Marci', role: 'Support' as DotaRole, winrate: 50.8, pickrate: 11.5, banrate: 3.2, tier: 'A' as const, trend: 'stable' as const, trendChange: 0.0 },
  { name: 'Hoodwink', role: 'Mid' as DotaRole, winrate: 51.1, pickrate: 8.9, banrate: 2.1, tier: 'A' as const, trend: 'up' as const, trendChange: 0.4 },
  { name: 'Juggernaut', role: 'Carry' as DotaRole, winrate: 49.8, pickrate: 14.5, banrate: 4.3, tier: 'B' as const, trend: 'down' as const, trendChange: -0.2 },
  { name: 'Sand King', role: 'Offlane' as DotaRole, winrate: 49.5, pickrate: 8.9, banrate: 2.5, tier: 'B' as const, trend: 'stable' as const, trendChange: 0.0 },
  { name: 'Crystal Maiden', role: 'Pos 5' as DotaRole, winrate: 49.2, pickrate: 9.7, banrate: 1.8, tier: 'B' as const, trend: 'down' as const, trendChange: -0.3 },
  { name: 'Undying', role: 'Offlane' as DotaRole, winrate: 49.0, pickrate: 7.3, banrate: 1.5, tier: 'B' as const, trend: 'down' as const, trendChange: -0.4 },
  { name: 'Storm Spirit', role: 'Mid' as DotaRole, winrate: 49.6, pickrate: 10.2, banrate: 3.8, tier: 'B' as const, trend: 'stable' as const, trendChange: 0.0 },
  { name: 'Huskar', role: 'Carry' as DotaRole, winrate: 48.5, pickrate: 6.8, banrate: 1.2, tier: 'C' as const, trend: 'down' as const, trendChange: -0.5 },
  { name: 'Necrophos', role: 'Mid' as DotaRole, winrate: 48.2, pickrate: 5.4, banrate: 0.9, tier: 'C' as const, trend: 'down' as const, trendChange: -0.6 },
  { name: 'Spirit Breaker', role: 'Pos 5' as DotaRole, winrate: 47.9, pickrate: 4.1, banrate: 0.5, tier: 'C' as const, trend: 'stable' as const, trendChange: 0.0 },
  { name: 'Arc Warden', role: 'Mid' as DotaRole, winrate: 47.5, pickrate: 2.3, banrate: 0.3, tier: 'C' as const, trend: 'down' as const, trendChange: -0.4 },
  { name: 'Tinker', role: 'Mid' as DotaRole, winrate: 50.4, pickrate: 7.6, banrate: 2.9, tier: 'A' as const, trend: 'up' as const, trendChange: 0.3 },
]

/* ────────────────────────────────────
   FEATURES & PRICING
   ──────────────────────────────────── */

const FEATURES_LIST = [
  { icon: BarChart3, title: 'Builds Optimizados', description: 'Calculados con datos de millones de partidas reales, filtrados por parche, rango y rol.', color: 'text-emerald-400', bgColor: 'bg-emerald-500/10' },
  { icon: Target, title: 'Counters Inteligentes', description: 'Descubre quién te countertea y cómo adaptar tu estrategia en tiempo real.', color: 'text-amber-400', bgColor: 'bg-amber-500/10' },
  { icon: Eye, title: 'Live Game Tracking', description: 'Analiza la partida en vivo con win probability y recomendaciones contextuales.', color: 'text-cyan-400', bgColor: 'bg-cyan-500/10' },
  { icon: Brain, title: 'IA Coach Personal', description: 'Diagnósticos post-partida y plan de mejora adaptado a tu estilo de juego.', color: 'text-violet-400', bgColor: 'bg-violet-500/10' },
  { icon: Trophy, title: 'Leaderboards Globales', description: 'Rankings por región, champion y rol. Comparate con los mejores del mundo.', color: 'text-yellow-400', bgColor: 'bg-yellow-500/10' },
  { icon: Users, title: 'Scouting de Equipos', description: 'Analiza a tus oponentes antes de la partida. Win rates y tendencias.', color: 'text-rose-400', bgColor: 'bg-rose-400/10' },
]

const PRICING = [
  { name: 'Free', price: '$0', period: 'para siempre', description: 'Perfecto para empezar a mejorar', features: ['Builds y runes básicos', 'Tier list general', '5 lookups de perfil/día', 'Counter picks básicos', 'Stats del parche actual'], cta: 'Empezar gratis', variant: 'outline' as const, popular: false },
  { name: 'Plus', price: '$7.99', period: '/mes', description: 'Para jugadores serios', features: ['Todo lo de Free', 'Builds avanzados por rango y rol', 'Live game tracking', 'IA Coach personal', 'Lookups ilimitados', 'Leaderboards avanzados', 'Scouting de oponentes', 'Sin anuncios'], cta: 'Probar 7 días gratis', variant: 'default' as const, popular: true },
  { name: 'Team', price: '$24.99', period: '/mes', description: 'Para equipos competitivos', features: ['Todo lo de Plus para 5 miembros', 'Draft analysis de equipo', 'Scouting avanzado', 'Reportes post-match', 'Discord bot integrado', 'Soporte prioritario', 'API access', 'Custom dashboards'], cta: 'Contactar ventas', variant: 'outline' as const, popular: false },
]

const NAV_LINKS = [
  { label: 'Tier List', href: '#tier-list' },
  { label: 'Características', href: '#features' },
  { label: 'Precios', href: '#pricing' },
]

/* ────────────────────────────────────
   HOOKS
   ──────────────────────────────────── */

function useIsDesktop() {
  const subscribe = useCallback((cb: () => void) => {
    const mql = window.matchMedia('(min-width: 1024px)')
    const handler = (e: MediaQueryListEvent) => cb()
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [])
  const getSnapshot = useCallback(() => window.matchMedia('(min-width: 1024px)').matches, [])
  const getServerSnapshot = useCallback(() => false, [])
  return React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

/* ────────────────────────────────────
   ANIMATION HELPERS (ENHANCED)
   ──────────────────────────────────── */

function FadeIn({ children, delay = 0, className = '', direction = 'up' }: { children: React.ReactNode; delay?: number; className?: string; direction?: 'up' | 'down' | 'left' | 'right' | 'none' }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-40px' })
  const directionMap = {
    up: { y: 24 }, down: { y: -24 }, left: { x: 24 }, right: { x: -24 }, none: {},
  }
  const initial = { opacity: 0, ...directionMap[direction] }
  return (
    <motion.div ref={ref} initial={initial} animate={isInView ? { opacity: 1, x: 0, y: 0 } : initial} transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }} className={className}>
      {children}
    </motion.div>
  )
}

function StaggerContainer({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-40px' })
  return (
    <motion.div ref={ref} initial="hidden" animate={isInView ? 'visible' : 'hidden'} variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }} className={className}>
      {children}
    </motion.div>
  )
}

function StaggerItem({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div variants={{ hidden: { opacity: 0, y: 16, scale: 0.98 }, visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } } }} className={className}>
      {children}
    </motion.div>
  )
}

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -4, transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] } },
}

/* Animated stat number that counts up when in view */
function AnimatedStat({ value, label, icon: Icon, delay = 0 }: { value: string; label: string; icon: typeof BarChart3; delay?: number }) {
  const numericValue = parseFloat(value.replace(/[^0-9.]/g, ''))
  const suffix = value.replace(/^[0-9.,]+/, '')
  const prefix = value.match(/^[^0-9]*/)?.[0] || ''
  const { display, ref } = useAnimatedCounter(numericValue, {
    duration: 1800,
    decimals: value.includes('.') ? 1 : 0,
    delay: delay * 1000,
    prefix,
    suffix: suffix || '+',
  })
  return (
    <div ref={ref} className="text-center group">
      <div className="flex items-center justify-center mb-1">
        <Icon className="w-3.5 h-3.5 text-emerald-400/50 mr-1.5 group-hover:text-emerald-400 transition-colors duration-300" />
        <div className="text-xl sm:text-2xl font-bold text-foreground group-hover:text-emerald-300 transition-colors duration-300 tabular-nums">{display}</div>
      </div>
      <div className="text-[11px] sm:text-xs text-muted-foreground">{label}</div>
    </div>
  )
}

/* 3D Tilt Card wrapper */
function TiltCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const tiltRef = useCardTilt({ maxTilt: 5, scale: 1.015 })
  return (
    <div ref={tiltRef} className={`card-3d ${className}`}>
      {children}
    </div>
  )
}

/* ────────────────────────────────────
   TOP NAVBAR (horizontal game list)
   ──────────────────────────────────── */

function Navbar({
  selectedGameId,
  onLogoClick,
  onSelectGame,
  onToggleMobileSidebar,
  onOpenCommandPalette,
}: {
  selectedGameId: GameId | null
  onLogoClick: () => void
  onSelectGame: (id: GameId) => void
  onToggleMobileSidebar: () => void
  onOpenCommandPalette: () => void
}) {
  const [scrolled, setScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'glass-strong border-b border-white/[0.06] shadow-lg shadow-black/30' : 'bg-transparent'}`}>
      <div className="px-2 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-14 gap-2">
          {/* Logo */}
          <motion.button
            onClick={onLogoClick}
            className="flex items-center gap-2 shrink-0 group cursor-pointer"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <motion.div
              className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center"
              whileHover={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 0.4 }}
            >
              <Trophy className="w-3.5 h-3.5 text-black" />
            </motion.div>
            <span className="font-bold text-sm tracking-tight hidden sm:inline">
              Tracker<span className="text-emerald-400">Stat</span>
              <span className="text-muted-foreground/60">.gg</span>
            </span>
          </motion.button>

          {/* Horizontal game list */}
          <div className="flex items-center gap-0.5 overflow-x-auto no-scrollbar flex-1 justify-center mx-2 py-1">
            {NAV_GAMES.map((game) => {
              const isActive = selectedGameId === game.id
              return (
                <button
                  key={game.id}
                  onClick={() => onSelectGame(game.id)}
                  className={`relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all duration-200 cursor-pointer shrink-0 ${
                    isActive
                      ? 'bg-white/10 text-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${game.dotColor} ${isActive ? 'ring-2 ring-offset-1 ring-offset-background' : ''}`} style={isActive ? { ringColor: 'var(--tw-ring-color)' } : undefined} />
                  <span className="hidden xl:inline">{game.name}</span>
                  <span className="xl:hidden">{game.shortName}</span>
                  {game.badge && (
                    <span className={`text-[9px] font-bold px-1 py-px rounded leading-none ${game.badge.bgColor} ${game.badge.color}`}>
                      {game.badge.text}
                    </span>
                  )}
                  {isActive && (
                    <motion.div layoutId="game-indicator" className="absolute bottom-0 left-1 right-1 h-0.5 bg-current rounded-full" transition={{ type: 'spring', stiffness: 400, damping: 30 }} />
                  )}
                </button>
              )
            })}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Mobile sidebar toggle (when game selected) */}
            {selectedGameId && (
              <Button variant="ghost" size="icon" className="h-8 w-8 lg:hidden" onClick={onToggleMobileSidebar}>
                <Menu className="w-4 h-4" />
              </Button>
            )}
            <div className="relative hidden sm:block">
              <button
                onClick={onOpenCommandPalette}
                className="flex items-center gap-2 h-8 px-3 rounded-md bg-secondary border border-border text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-all cursor-pointer"
              >
                <Search className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Buscar...</span>
                <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded border border-border bg-background text-[9px] text-muted-foreground/60">
                  ⌘K
                </kbd>
              </button>
            </div>
            <Button variant="ghost" size="sm" className="hidden md:flex h-8 text-xs">Iniciar sesión</Button>
            <Button size="sm" className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold h-8 text-xs px-3">Registrarse</Button>
          </div>
        </div>
      </div>
    </nav>
  )
}

/* ────────────────────────────────────
   COLLAPSIBLE SIDEBAR (per game)
   ──────────────────────────────────── */

function GameSidebar({
  game,
  expanded,
  onToggle,
  activeSection,
  onSectionChange,
}: {
  game: Game
  expanded: boolean
  onToggle: () => void
  activeSection: string
  onSectionChange: (id: string) => void
}) {
  const sections = SIDEBAR_SECTIONS[game.id]

  const accentMap: Record<string, string> = {
    emerald: 'border-l-emerald-500 bg-emerald-500/10 text-emerald-400',
    red: 'border-l-red-500 bg-red-500/10 text-red-400',
    green: 'border-l-green-500 bg-green-500/10 text-green-400',
    amber: 'border-l-amber-500 bg-amber-500/10 text-amber-400',
    violet: 'border-l-violet-500 bg-violet-500/10 text-violet-400',
    purple: 'border-l-purple-500 bg-purple-500/10 text-purple-400',
    orange: 'border-l-orange-500 bg-orange-500/10 text-orange-400',
    rose: 'border-l-rose-500 bg-rose-500/10 text-rose-400',
  }

  const activeClasses = accentMap[game.accentColor] || accentMap.emerald

  return (
    <TooltipProvider delayDuration={0}>
      <motion.aside
        className="fixed left-0 top-14 bottom-0 z-40 hidden lg:flex flex-col bg-background/95 backdrop-blur-xl border-r border-border overflow-hidden"
        animate={{ width: expanded ? 200 : 56 }}
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Section items */}
        <div className="flex-1 py-3 overflow-y-auto no-scrollbar">
          {sections.map((section) => {
            const Icon = section.icon
            const isActive = activeSection === section.id

            const btn = (
              <button
                key={section.id}
                onClick={() => onSectionChange(section.id)}
                className={`flex items-center w-full text-sm transition-all duration-150 cursor-pointer border-l-2 ${
                  isActive
                    ? activeClasses
                    : 'border-l-transparent text-muted-foreground hover:text-foreground hover:bg-white/[0.03]'
                } ${expanded ? 'px-3 py-2.5' : 'px-0 justify-center py-2.5'}`}
              >
                <Icon className="w-5 h-5 shrink-0 mx-auto" />
                <AnimatePresence>
                  {expanded && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.15 }}
                      className="ml-3 whitespace-nowrap overflow-hidden font-medium text-xs"
                    >
                      {section.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            )

            if (!expanded) {
              return (
                <Tooltip key={section.id}>
                  <TooltipTrigger asChild>{btn}</TooltipTrigger>
                  <TooltipContent side="right" className="text-xs font-medium">
                    {section.label}
                  </TooltipContent>
                </Tooltip>
              )
            }

            return <div key={section.id}>{btn}</div>
          })}
        </div>

        {/* Toggle button */}
        <button
          onClick={onToggle}
          className="flex items-center justify-center py-3 border-t border-border text-muted-foreground hover:text-foreground hover:bg-white/[0.03] transition-colors cursor-pointer"
        >
          {expanded ? (
            <ChevronsLeft className="w-4 h-4" />
          ) : (
            <ChevronsRight className="w-4 h-4" />
          )}
          <AnimatePresence>
            {expanded && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="ml-2 text-xs font-medium"
              >
                Colapsar
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </motion.aside>
    </TooltipProvider>
  )
}

/* ────────────────────────────────────
   MOBILE SIDEBAR OVERLAY
   ──────────────────────────────────── */

function MobileSidebar({
  game,
  open,
  onClose,
  activeSection,
  onSectionChange,
}: {
  game: Game
  open: boolean
  onClose: () => void
  activeSection: string
  onSectionChange: (id: string) => void
}) {
  const sections = SIDEBAR_SECTIONS[game.id]

  const accentMap: Record<string, string> = {
    emerald: 'border-l-emerald-500 bg-emerald-500/10 text-emerald-400',
    red: 'border-l-red-500 bg-red-500/10 text-red-400',
    green: 'border-l-green-500 bg-green-500/10 text-green-400',
    amber: 'border-l-amber-500 bg-amber-500/10 text-amber-400',
    violet: 'border-l-violet-500 bg-violet-500/10 text-violet-400',
    purple: 'border-l-purple-500 bg-purple-500/10 text-purple-400',
    orange: 'border-l-orange-500 bg-orange-500/10 text-orange-400',
    rose: 'border-l-rose-500 bg-rose-500/10 text-rose-400',
  }

  const activeClasses = accentMap[game.accentColor] || accentMap.emerald

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          {/* Sidebar panel */}
          <motion.aside
            className="fixed left-0 top-14 bottom-0 z-50 lg:hidden flex flex-col bg-background/95 backdrop-blur-xl border-r border-border w-64"
            initial={{ x: -256 }}
            animate={{ x: 0 }}
            exit={{ x: -256 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Game header */}
            <div className="px-4 py-4 border-b border-border flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                <game.icon className={`w-4.5 h-4.5 ${game.iconColor}`} />
              </div>
              <div>
                <div className="text-sm font-semibold">{game.name}</div>
                <div className="text-[10px] text-muted-foreground">{game.tagline}</div>
              </div>
            </div>

            {/* Sections */}
            <div className="flex-1 py-2 overflow-y-auto">
              {sections.map((section) => {
                const Icon = section.icon
                const isActive = activeSection === section.id
                return (
                  <button
                    key={section.id}
                    onClick={() => { onSectionChange(section.id); onClose() }}
                    className={`flex items-center w-full px-4 py-2.5 text-sm transition-all duration-150 cursor-pointer border-l-2 ${
                      isActive
                        ? activeClasses
                        : 'border-l-transparent text-muted-foreground hover:text-foreground hover:bg-white/[0.03]'
                    }`}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    <span className="ml-3 font-medium text-xs">{section.label}</span>
                  </button>
                )
              })}
            </div>

            {/* Close button */}
            <div className="p-3 border-t border-border">
              <Button variant="ghost" className="w-full justify-center text-xs h-8" onClick={onClose}>
                <X className="w-4 h-4 mr-2" />
                Cerrar menú
              </Button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}

/* ────────────────────────────────────
   HOME PAGE (Game Selection)
   ──────────────────────────────────── */

function HomePage({ onSelectGame }: { onSelectGame: (id: GameId) => void }) {
  return (
    <motion.div key="home" variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <main>
        {/* Hero: Game Selection */}
        <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0">
            <div className="hero-grid absolute inset-0" />
            <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background" />
            {/* Animated gradient orbs */}
            <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-emerald-500/[0.07] rounded-full blur-[140px] floating-orb" />
            <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-amber-500/[0.05] rounded-full blur-[120px] floating-orb-delay-1" />
            <div className="absolute top-1/2 right-1/3 w-[300px] h-[300px] bg-violet-500/[0.04] rounded-full blur-[100px] floating-orb-delay-2" />
            {/* Floating particles */}
            <FloatingParticles count={25} className="z-[1]" />
          </div>

          <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12 w-full">
            <FadeIn className="text-center mb-12">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 px-4 py-1.5 text-sm mb-6 cursor-default hover:bg-emerald-500/15 transition-colors">
                  <Flame className="w-3.5 h-3.5 mr-1.5" />
                  Temporada 2025 — Datos en tiempo real
                </Badge>
              </motion.div>
              <motion.h1
                className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4 text-gradient-hero"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              >
                Elige tu juego
              </motion.h1>
              <motion.p
                className="text-muted-foreground max-w-lg mx-auto text-base sm:text-lg"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              >
                Datos competitivos, builds optimizados y coaching con IA para los juegos más populares.
              </motion.p>
            </FadeIn>

            {/* Game Cards Grid - 4 cols on large */}
            <StaggerContainer className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
              {GAMES.map((game) => (
                <StaggerItem key={game.id}>
                  <TiltCard>
                    <button
                      onClick={() => onSelectGame(game.id)}
                      className={`group relative w-full aspect-[16/10] rounded-xl overflow-hidden border border-white/[0.08] cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:border-white/20 hover:shadow-2xl hover:shadow-black/40 spotlight ${game.accentHover}`}
                    >
                      {/* Background: image or gradient */}
                      {game.image ? (
                        <img
                          src={game.image}
                          alt={game.name}
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      ) : (
                        <div className={`absolute inset-0 bg-gradient-to-br ${game.gradientBg}`} />
                      )}
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10 group-hover:from-black/80 transition-colors duration-300" />

                      {/* Animated border glow on hover */}
                      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ boxShadow: `inset 0 0 30px rgba(16, 185, 129, 0.05)` }} />

                      {/* Badge */}
                      {game.badge && (
                        <motion.div
                          className="absolute top-2.5 left-2.5 z-10"
                          initial={{ x: -10, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ duration: 0.4, delay: 0.2 }}
                        >
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${game.badge.color} shadow-lg`}>
                            {game.badge.text}
                          </span>
                        </motion.div>
                      )}

                      {/* Coming soon badge */}
                      {game.isComingSoon && (
                        <div className="absolute top-2.5 right-2.5 z-10">
                          <span className="text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-white/10 backdrop-blur-sm text-white/80 border border-white/10">
                            Coming Soon
                          </span>
                        </div>
                      )}

                      {/* Arrow icon on hover */}
                      {!game.isComingSoon && (
                        <div className="absolute top-2.5 right-2.5 z-10 w-7 h-7 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:bg-white/20 group-hover:scale-110">
                          <ArrowUpRight className="w-3.5 h-3.5 text-white" />
                        </div>
                      )}

                      {/* Content */}
                      <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 z-10">
                        <h3 className="text-sm sm:text-base font-semibold text-white leading-tight mb-0.5 group-hover:translate-y-[-1px] transition-transform duration-300">
                          {game.name}
                        </h3>
                        <p className="text-[10px] sm:text-xs text-white/60 group-hover:text-white/80 transition-colors duration-300">
                          {game.tagline}
                        </p>
                      </div>
                    </button>
                  </TiltCard>
                </StaggerItem>
              ))}
            </StaggerContainer>

            {/* Quick stats with animated counters */}
            <FadeIn delay={0.4} className="mt-12 flex flex-wrap items-center justify-center gap-6 sm:gap-10">
              <AnimatedStat value="2.5" label="Partidas analizadas" icon={BarChart3} delay={0.5} />
              <AnimatedStat value="500" label="Jugadores activos" icon={Users} delay={0.6} />
              <AnimatedStat value="99.2" label="Precisión de datos" icon={Target} delay={0.7} />
              <div className="text-center group">
                <div className="flex items-center justify-center mb-1">
                  <Zap className="w-3.5 h-3.5 text-emerald-400/50 mr-1.5 group-hover:text-emerald-400 transition-colors" />
                  <motion.div
                    className="text-xl sm:text-2xl font-bold text-foreground group-hover:text-emerald-300 transition-colors"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8, duration: 0.5 }}
                  >
                    &lt; 2s
                  </motion.div>
                </div>
                <div className="text-[11px] sm:text-xs text-muted-foreground">Tiempo de respuesta</div>
              </div>
            </FadeIn>

            {/* Cmd+K Hint */}
            <FadeIn delay={0.5} className="mt-6">
              <button
                onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] text-xs text-muted-foreground hover:text-foreground transition-all cursor-pointer"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Buscar campeones, agentes, héroes...</span>
                <kbd className="px-1.5 py-0.5 rounded border border-white/[0.08] bg-white/[0.04] text-[10px] font-mono">⌘K</kbd>
              </button>
            </FadeIn>
          </div>
        </section>

        {/* Live Meta Pulse — Cross-game overview */}
        <section className="relative py-16 sm:py-20">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/[0.015] to-transparent" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <FadeIn className="text-center mb-10">
              <Badge variant="outline" className="mb-4 hover:bg-emerald-500/5 transition-colors"><Activity className="w-3.5 h-3.5 mr-1.5 text-cyan-400" />Live Meta Pulse</Badge>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
                El meta en <span className="text-gradient-emerald">tiempo real</span>
              </h2>
              <p className="text-muted-foreground max-w-lg mx-auto text-sm">Datos actualizados de todos los juegos activos. Haz clic para explorar.</p>
            </FadeIn>
            <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {GAMES.filter(g => !g.isComingSoon).map((game) => {
                const accent = ACCENT_MAP[game.accentColor] || ACCENT_MAP.emerald
                const Icon = game.icon
                const sTierCount = game.tierList?.reduce((sum, t) => sum + t.champions.length, 0) || 0
                return (
                  <StaggerItem key={game.id}>
                    <TiltCard>
                      <button
                        onClick={() => onSelectGame(game.id)}
                        className={`w-full text-left p-4 rounded-xl border ${accent.border} ${accent.bg} hover:bg-white/[0.04] transition-all cursor-pointer group animated-border-hover`}
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <motion.div
                            className={`w-8 h-8 rounded-lg ${accent.bg} border ${accent.border} flex items-center justify-center`}
                            whileHover={{ rotate: [0, -10, 10, -5, 5, 0], transition: { duration: 0.5 } }}
                          >
                            <Icon className={`w-4 h-4 ${accent.text}`} />
                          </motion.div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-semibold truncate">{game.shortName}</div>
                            <div className="text-[9px] text-muted-foreground">{game.features[0]?.title || ''}</div>
                          </div>
                          <ArrowRight className={`w-3.5 h-3.5 text-muted-foreground/40 group-hover:${accent.text} group-hover:translate-x-0.5 transition-all`} />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {game.features.slice(0, 4).map((feat) => (
                            <div key={feat.title} className="space-y-0.5">
                              <div className={`text-sm font-bold ${accent.text} leading-tight`}>{feat.stat}</div>
                              <div className="text-[9px] text-muted-foreground truncate">{feat.title}</div>
                            </div>
                          ))}
                        </div>
                        {/* Mini activity bar */}
                        <div className="mt-3 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-live" />
                          <span className="text-[9px] text-muted-foreground/60">Live</span>
                          <span className="text-[9px] text-muted-foreground/40 ml-auto">{sTierCount} S-tier</span>
                        </div>
                      </button>
                    </TiltCard>
                  </StaggerItem>
                )
              })}
            </StaggerContainer>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="relative py-24 sm:py-32">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/[0.02] to-transparent" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <FadeIn className="text-center mb-16">
              <Badge variant="outline" className="mb-4 hover:bg-emerald-500/5 transition-colors"><Zap className="w-3.5 h-3.5 mr-1.5" />Características</Badge>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
                Todo lo que necesitas para <span className="text-gradient-emerald">mejorar</span>
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">Herramientas profesionales construidas sobre datos reales.</p>
            </FadeIn>
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {FEATURES_LIST.map((feature) => {
                const Icon = feature.icon
                return (
                  <StaggerItem key={feature.title}>
                    <Card className="group h-full hover:border-white/15 transition-all duration-500 py-0 animated-border-hover glass">
                      <CardContent className="p-6">
                        <motion.div
                          className={`w-11 h-11 rounded-xl ${feature.bgColor} flex items-center justify-center mb-4`}
                          whileHover={{ scale: 1.15, rotate: 5 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                        >
                          <Icon className={`w-5 h-5 ${feature.color}`} />
                        </motion.div>
                        <h3 className="text-base font-semibold mb-2 group-hover:text-foreground transition-colors">{feature.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                      </CardContent>
                    </Card>
                  </StaggerItem>
                )
              })}
            </StaggerContainer>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="relative py-24 sm:py-32">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-500/[0.02] to-transparent" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <FadeIn className="text-center mb-16">
              <Badge variant="outline" className="mb-4 hover:bg-amber-500/5 transition-colors"><Star className="w-3.5 h-3.5 mr-1.5" />Precios</Badge>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
                Elige tu nivel de <span className="text-gradient-gold">competitividad</span>
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">Desde gratis hasta equipo. Mejora a tu ritmo.</p>
            </FadeIn>
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
              {PRICING.map((plan) => (
                <StaggerItem key={plan.name}>
                  <TiltCard>
                    <Card className={`relative h-full hover:border-white/15 transition-all duration-500 py-0 glass ${plan.popular ? 'border-emerald-500/40 tier-s-glow' : ''}`}>
                      {plan.popular && (
                        <motion.div
                          className="absolute -top-3 left-1/2 -translate-x-1/2"
                          initial={{ y: -10, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.3, duration: 0.5, type: 'spring' }}
                        >
                          <Badge className="bg-emerald-500 text-black font-semibold px-3 py-1 shadow-lg shadow-emerald-500/25">Más popular</Badge>
                        </motion.div>
                      )}
                      <CardHeader className="pb-2 pt-6">
                        <CardTitle className="text-lg">{plan.name}</CardTitle>
                        <CardDescription>{plan.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div>
                          <span className={`text-4xl font-bold ${plan.popular ? 'text-gradient-emerald' : ''}`}>{plan.price}</span>
                          <span className="text-muted-foreground text-sm">{plan.period}</span>
                        </div>
                        <ul className="space-y-2.5">
                          {plan.features.map((f, i) => (
                            <motion.li
                              key={f}
                              className="flex items-start gap-2.5 text-sm"
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.4 + i * 0.05, duration: 0.3 }}
                            >
                              <Check className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                              <span className="text-muted-foreground">{f}</span>
                            </motion.li>
                          ))}
                        </ul>
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Button variant={plan.variant} className={`w-full h-10 transition-all duration-300 ${plan.popular ? 'bg-emerald-500 hover:bg-emerald-400 text-black font-semibold shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30' : 'hover:bg-white/[0.06]'}`}>
                            {plan.cta}
                          </Button>
                        </motion.div>
                      </CardContent>
                    </Card>
                  </TiltCard>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>

        {/* CTA */}
        <section className="relative py-24 sm:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <FadeIn>
              <div className="relative rounded-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-emerald-900/10 to-transparent" />
                <div className="absolute inset-0 hero-grid opacity-50" />
                <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px] breathe" />
                <div className="absolute bottom-0 left-0 w-60 h-60 bg-amber-500/[0.06] rounded-full blur-[80px] breathe-slow" />
                <div className="relative px-6 sm:px-12 py-16 sm:py-20 text-center">
                  <motion.h2
                    className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4"
                    initial={{ y: 20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                  >
                    ¿Listo para subir de rango?
                  </motion.h2>
                  <motion.p
                    className="text-lg text-muted-foreground max-w-xl mx-auto mb-8"
                    initial={{ y: 20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                  >
                    Únete a más de 500,000 jugadores que ya usan TrackerStat.gg. Empieza gratis hoy.
                  </motion.p>
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                  >
                    <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                      <Button size="lg" className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold h-12 px-8 text-base shadow-lg shadow-emerald-500/25 transition-all hover:shadow-emerald-500/40 glow-emerald">
                        Crear cuenta gratis <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </motion.div>
                    <p className="text-xs text-muted-foreground mt-4">No requiere tarjeta de crédito. Cancela cuando quieras.</p>
                  </motion.div>
                </div>
              </div>
            </FadeIn>
          </div>
        </section>
      </main>

      <Footer />
    </motion.div>
  )
}

/* ────────────────────────────────────
   LOL SECTION COMPONENTS (Redesigned)
   ──────────────────────────────────── */

function WinRateBar({ value, max = 55, min = 45 }: { value: number; max?: number; min?: number }) {
  const pct = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100))
  const color = value >= 52 ? 'bg-emerald-500' : value >= 50 ? 'bg-emerald-400/70' : value >= 49 ? 'bg-amber-400/60' : 'bg-rose-400/70'
  const glow = value >= 52 ? 'shadow-emerald-500/30' : ''
  return (
    <div className="w-full h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
      <motion.div
        className={`h-full rounded-full ${color} ${glow}`}
        initial={{ width: 0, opacity: 0 }}
        animate={{ width: `${pct}%`, opacity: 1 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
      />
    </div>
  )
}

function ChampionCard({ champ, compact = false, index = 0 }: { champ: LoLChampion; compact?: boolean; index?: number }) {
  const rc = ROLE_COLORS[champ.role]
  const ts = TIER_STYLES[champ.tier]
  const wrColor = champ.winrate >= 51 ? 'text-emerald-400' : champ.winrate >= 50 ? 'text-foreground' : 'text-rose-400'
  const TrendIcon = champ.trend === 'up' ? ChevronRight : champ.trend === 'down' ? ChevronLeft : null
  const trendColor = champ.trend === 'up' ? 'text-emerald-400' : champ.trend === 'down' ? 'text-rose-400' : 'text-muted-foreground'
  const tierDotColor = champ.tier === 'S' ? 'bg-yellow-400' : champ.tier === 'A' ? 'bg-emerald-400' : champ.tier === 'B' ? 'bg-blue-400' : 'bg-violet-400'
  const isSTier = champ.tier === 'S'

  if (compact) {
    return (
      <motion.div
        className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/[0.03] transition-all cursor-pointer border border-transparent hover:border-white/[0.04] ${isSTier ? 'tier-s-glow' : ''}`}
        whileHover={{ x: 4 }}
        transition={{ duration: 0.2 }}
      >
        <span className="text-[11px] font-bold text-muted-foreground/50 w-5 text-right shrink-0">{index + 1}</span>
        <div className={`w-9 h-9 rounded-lg ${rc.bg} border ${rc.border} flex items-center justify-center text-sm font-bold ${rc.text} shrink-0 group-hover:scale-110 transition-transform duration-300`}>
          {champ.name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold truncate group-hover:text-emerald-300 transition-colors">{champ.name}</span>
            <div className="flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${tierDotColor} ${isSTier ? 'pulse-live' : ''}`} />
              <span className={`text-[10px] font-bold ${ts.text}`}>{champ.tier}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-0.5">
            <span className={`text-xs font-semibold ${wrColor}`}>{champ.winrate}%</span>
            <WinRateBar value={champ.winrate} />
          </div>
        </div>
        <div className="text-right shrink-0 flex items-center gap-2">
          <span className="text-[11px] text-muted-foreground hidden sm:inline">{champ.pickrate}% PR</span>
          {TrendIcon && <span className={`text-[11px] font-medium ${trendColor} flex items-center gap-0.5`}><TrendIcon className="w-3 h-3" />{champ.trendChange > 0 ? '+' : ''}{champ.trendChange}%</span>}
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      className={`group flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-white/[0.03] transition-all cursor-pointer border border-transparent hover:border-white/[0.04] ${isSTier ? 'tier-s-glow' : ''}`}
      whileHover={{ x: 2 }}
      transition={{ duration: 0.15 }}
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        <div className={`w-8 h-8 rounded-full ${rc.bg} border ${rc.border} flex items-center justify-center text-xs font-bold ${rc.text} group-hover:scale-110 transition-transform duration-300`}>
          {champ.name.charAt(0)}
        </div>
        {/* Tier dot */}
        <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ${tierDotColor} border-2 border-[#09090b] flex items-center justify-center ${isSTier ? 'pulse-live' : ''}`}>
          <span className="text-[6px] font-black text-black leading-none">{champ.tier}</span>
        </span>
      </div>
      {/* Name + role */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold truncate group-hover:text-emerald-300 transition-colors duration-200">{champ.name}</span>
          <span className={`text-[9px] px-1 py-px rounded font-medium ${rc.bg} ${rc.text} border ${rc.border} leading-none`}>{champ.role}</span>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className={`text-[11px] font-bold ${wrColor}`}>{champ.winrate}%</span>
          <WinRateBar value={champ.winrate} />
        </div>
      </div>
      {/* Pick rate + trend */}
      <div className="text-right shrink-0 flex items-center gap-2">
        <span className="text-[10px] text-muted-foreground hidden sm:inline">{champ.pickrate}% PR</span>
        <span className="text-[10px] text-muted-foreground/60 hidden md:inline">{champ.banrate}% BR</span>
        {TrendIcon && <span className={`text-[10px] font-semibold ${trendColor} flex items-center gap-0.5`}><TrendIcon className="w-2.5 h-2.5" />{champ.trendChange > 0 ? '+' : ''}{champ.trendChange}%</span>}
      </div>
    </motion.div>
  )
}

function RoleFilterTabs({ selected, onChange }: { selected: LoLRole | 'All'; onChange: (r: LoLRole | 'All') => void }) {
  const dotColors: Record<string, string> = {
    Top: 'bg-orange-400', Jungle: 'bg-green-400', Mid: 'bg-cyan-400', ADC: 'bg-red-400', Support: 'bg-yellow-400',
  }
  return (
    <div className="flex items-center gap-0.5">
      {LOL_ROLES.map((role) => {
        const isActive = selected === role.id
        const isAll = role.id === 'All'
        return (
          <button
            key={role.id}
            onClick={() => onChange(role.id)}
            className={`relative flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap transition-all duration-150 cursor-pointer shrink-0 ${
              isActive
                ? 'bg-white/[0.08] text-foreground'
                : 'text-muted-foreground/60 hover:text-foreground hover:bg-white/[0.04]'
            }`}
          >
            {!isAll && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[role.id]} ${isActive ? 'shadow-sm' : 'opacity-40'}`} />}
            {role.label}
            {isActive && <motion.div layoutId="lol-role-tab" className="absolute bottom-0 left-1 right-1 h-0.5 bg-emerald-500 rounded-full" transition={{ type: 'spring', stiffness: 400, damping: 30 }} />}
          </button>
        )
      })}
    </div>
  )
}

function LoLHomeSection() {
  const [roleFilter, setRoleFilter] = useState<LoLRole | 'All'>('All')
  const [search, setSearch] = useState('')
  const filtered = LOL_CHAMPIONS.filter(c => {
    if (roleFilter !== 'All' && c.role !== roleFilter) return false
    if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  }).sort((a, b) => {
    const tierOrder = { S: 0, A: 1, B: 2, C: 3 }
    if (tierOrder[a.tier] !== tierOrder[b.tier]) return tierOrder[a.tier] - tierOrder[b.tier]
    return b.winrate - a.winrate
  })

  const bestWR = LOL_CHAMPIONS.reduce((a, b) => a.winrate > b.winrate ? a : b)
  const mostBanned = LOL_CHAMPIONS.reduce((a, b) => a.banrate > b.banrate ? a : b)
  const mostPicked = LOL_CHAMPIONS.reduce((a, b) => a.pickrate > b.pickrate ? a : b)
  const trending = LOL_CHAMPIONS.filter(c => c.trend === 'up').sort((a, b) => b.trendChange - a.trendChange).slice(0, 6)
  const sTierChamps = LOL_CHAMPIONS.filter(c => c.tier === 'S')

  // Get best champ per role
  const bestByRole = (['Top', 'Jungle', 'Mid', 'ADC', 'Support'] as LoLRole[]).map(role => {
    const champs = LOL_CHAMPIONS.filter(c => c.role === role)
    const best = champs.reduce((a, b) => a.winrate > b.winrate ? a : b)
    return { ...best }
  })

  return (
    <>
      {/* ── Compact Header ── */}
      <FadeIn>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
              <Swords className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold tracking-tight">League of Legends</h1>
                <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/25 text-[9px] font-semibold px-1.5 py-0">Patch 15.5</Badge>
              </div>
              <p className="text-[11px] text-muted-foreground">Builds, Counters, Runes and more</p>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
            <Input
              placeholder="Search champion..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-7 pl-7 pr-3 bg-white/[0.04] border-white/[0.06] text-xs w-full sm:w-48 placeholder:text-muted-foreground/40 focus:border-emerald-500/25"
            />
          </div>
        </div>
      </FadeIn>

      {/* ── Quick Stats Strip ── */}
      <FadeIn delay={0.05}>
        <div className="grid grid-cols-4 gap-2 mb-5">
          {[
            { label: 'Best Win Rate', value: `${bestWR.winrate}%`, sub: bestWR.name, role: bestWR.role, icon: Flame, color: 'text-emerald-400', bg: 'bg-emerald-500/[0.04]' },
            { label: 'Most Picked', value: `${mostPicked.pickrate}%`, sub: mostPicked.name, role: mostPicked.role, icon: Target, color: 'text-cyan-400', bg: 'bg-cyan-500/[0.04]' },
            { label: 'Most Banned', value: `${mostBanned.banrate}%`, sub: mostBanned.name, role: mostBanned.role, icon: Shield, color: 'text-rose-400', bg: 'bg-rose-500/[0.04]' },
            { label: 'Games Tracked', value: '2.5M+', sub: 'This patch', role: null, icon: BarChart3, color: 'text-amber-400', bg: 'bg-amber-500/[0.04]' },
          ].map(s => {
            const rc = s.role ? ROLE_COLORS[s.role] : null
            return (
              <div key={s.label} className={`group flex items-center gap-2 p-2 rounded-lg ${s.bg} hover:bg-white/[0.04] transition-all cursor-pointer` }>
                <s.icon className={`w-3.5 h-3.5 ${s.color} shrink-0`} />
                <div className="min-w-0 flex-1">
                  <div className={`text-xs font-bold ${s.color} leading-tight`}>{s.value}</div>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-muted-foreground truncate">{s.sub}</span>
                    {rc && <span className={`text-[8px] px-0.5 py-px rounded font-semibold ${rc.bg} ${rc.text} border ${rc.border}`}>{s.role}</span>}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </FadeIn>

      {/* ── Best Champion by Role Strip ── */}
      <FadeIn delay={0.07}>
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Star className="w-3 h-3 text-yellow-400" />
              Best in Each Role
            </h2>
          </div>
          <div className="grid grid-cols-5 gap-1.5">
            {bestByRole.map(({ role, name, winrate }) => {
              const rc = ROLE_COLORS[role]
              return (
                <button
                  key={role}
                  onClick={() => setRoleFilter(role)}
                  className={`group flex items-center gap-2 p-2 rounded-lg border transition-all cursor-pointer ${
                    roleFilter === role
                      ? `${rc.bg} ${rc.border} border`
                      : 'bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.04] hover:border-white/[0.1]'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-full ${rc.bg} border ${rc.border} flex items-center justify-center text-[10px] font-bold ${rc.text} shrink-0 group-hover:scale-105 transition-transform`}>
                    {name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] font-semibold truncate leading-tight">{name}</div>
                    <div className="text-[9px] text-muted-foreground">{winrate}%</div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </FadeIn>

      {/* ── Role Tabs + Champion List ── */}
      <FadeIn delay={0.1}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <RoleFilterTabs selected={roleFilter} onChange={setRoleFilter} />
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground whitespace-nowrap">{filtered.length} champions</span>
            <div className="flex items-center gap-0.5">
              {['S', 'A', 'B', 'C'].map(t => {
                const count = filtered.filter(c => c.tier === t).length
                const tc = TIER_STYLES[t]
                return (
                  <span key={t} className={`text-[9px] font-bold px-1 py-0.5 rounded ${tc.bg} ${tc.text} border ${tc.border}`}>
                    {t}: {count}
                  </span>
                )
              })}
            </div>
          </div>
        </div>
        <StaggerContainer className="rounded-xl border border-white/[0.06] bg-white/[0.01] overflow-hidden divide-y divide-white/[0.03]">
          {filtered.map((c, i) => (
            <StaggerItem key={c.name}><ChampionCard champ={c} index={i} /></StaggerItem>
          ))}
        </StaggerContainer>
      </FadeIn>

      {/* ── Trending + Meta Snapshot ── */}
      <FadeIn delay={0.15} className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            Patch Trends
          </h2>
          <Badge variant="outline" className="text-[9px] gap-1">
            <TrendingUp className="w-2.5 h-2.5" />
            Last 7 days
          </Badge>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {/* Trending champions list */}
          <div className="lg:col-span-2">
            <div className="rounded-lg border border-white/[0.06] bg-white/[0.01] overflow-hidden">
              <div className="px-3 py-2 border-b border-white/[0.04] bg-white/[0.02]">
                <h3 className="text-[10px] font-semibold flex items-center gap-1 text-emerald-400 uppercase tracking-wider">
                  <ArrowUpRight className="w-3 h-3" />
                  Rising Champions
                </h3>
              </div>
              <div className="divide-y divide-white/[0.03]">
                {trending.map((c, i) => (
                  <ChampionCard key={c.name} champ={c} compact index={i} />
                ))}
              </div>
            </div>
          </div>

          {/* Meta overview */}
          <div className="space-y-3">
            {/* Role Strength */}
            <div className="rounded-lg border border-white/[0.06] bg-white/[0.01] overflow-hidden">
              <div className="px-3 py-2 border-b border-white/[0.04] bg-white/[0.02]">
                <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Role Win Rates</h3>
              </div>
              <div className="p-2 space-y-0.5">
                {(['Top', 'Jungle', 'Mid', 'ADC', 'Support'] as LoLRole[]).map(role => {
                  const champs = LOL_CHAMPIONS.filter(c => c.role === role)
                  const avgWR = champs.reduce((a, b) => a + b.winrate, 0) / champs.length
                  const best = champs.reduce((a, b) => a.winrate > b.winrate ? a : b)
                  const rc = ROLE_COLORS[role]
                  return (
                    <div key={role} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-white/[0.03] transition-colors cursor-pointer">
                      <div className={`w-1.5 h-6 rounded-full ${rc.dot}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-[11px] font-medium">{role}</span>
                          <span className={`text-[10px] font-bold ${avgWR >= 51 ? 'text-emerald-400' : 'text-foreground'}`}>{avgWR.toFixed(1)}%</span>
                        </div>
                        <WinRateBar value={avgWR} max={53} min={48} />
                        <span className="text-[9px] text-muted-foreground/50">Best: {best.name}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* S-Tier Champions - compact */}
            <div className="rounded-lg border border-yellow-500/15 bg-yellow-500/[0.02] overflow-hidden">
              <div className="px-3 py-2 border-b border-yellow-500/10 bg-yellow-500/[0.03]">
                <h3 className="text-[10px] font-semibold flex items-center gap-1 text-yellow-400 uppercase tracking-wider">
                  <Crown className="w-3 h-3" />
                  S-Tier Champions
                </h3>
              </div>
              <div className="p-2 space-y-0.5">
                {sTierChamps.map(c => {
                  const rc = ROLE_COLORS[c.role]
                  return (
                    <div key={c.name} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-white/[0.04] transition-colors cursor-pointer">
                      <div className={`w-6 h-6 rounded-full ${rc.bg} border ${rc.border} flex items-center justify-center text-[9px] font-bold ${rc.text} shrink-0`}>
                        {c.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-semibold truncate">{c.name}</span>
                        <span className="text-[9px] text-muted-foreground ml-1">{c.role}</span>
                      </div>
                      <span className="text-[10px] font-bold text-yellow-400">{c.winrate}%</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Pro Builds spotlight - compact */}
            <div className="rounded-lg border border-white/[0.06] bg-white/[0.01] overflow-hidden">
              <div className="px-3 py-2 border-b border-white/[0.04] bg-white/[0.02]">
                <h3 className="text-[10px] font-semibold flex items-center gap-1 uppercase tracking-wider text-muted-foreground">
                  <Star className="w-3 h-3 text-amber-400" />
                  Pro Spotlight
                </h3>
              </div>
              <div className="p-2 space-y-0.5">
                {LOL_PRO_BUILDS.slice(0, 3).map(pb => {
                  const rc = ROLE_COLORS[pb.role as LoLRole]
                  return (
                    <div key={pb.player} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-white/[0.03] transition-colors cursor-pointer">
                      <div className={`w-6 h-6 rounded-full ${rc.bg} border ${rc.border} flex items-center justify-center text-[9px] font-bold ${rc.text} shrink-0`}>
                        {pb.champion.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] font-semibold truncate">{pb.player}</div>
                        <div className="text-[9px] text-muted-foreground">{pb.champion} · {pb.team}</div>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-400">{pb.winrate}%</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </FadeIn>

      {/* ── CTA (compact) ── */}
      <FadeIn delay={0.2} className="mt-8">
        <div className="flex items-center justify-between gap-4 p-4 rounded-lg bg-emerald-500/[0.04] border border-emerald-500/10">
          <div>
            <h2 className="text-xs font-bold">Want to climb faster?</h2>
            <p className="text-[10px] text-muted-foreground mt-0.5">Get optimized builds, counters, live tracking & AI coaching.</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button size="sm" className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold h-7 text-[11px] px-3">
              Sign up free <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
            <Button variant="outline" size="sm" className="h-7 text-[11px] px-3">
              View Tier List
            </Button>
          </div>
        </div>
      </FadeIn>
    </>
  )
}

function LoLChampionsSection() {
  const [roleFilter, setRoleFilter] = useState<LoLRole | 'All'>('All')
  const [search, setSearch] = useState('')
  const filtered = LOL_CHAMPIONS.filter(c => {
    if (roleFilter !== 'All' && c.role !== roleFilter) return false
    if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  }).sort((a, b) => {
    const tierOrder = { S: 0, A: 1, B: 2, C: 3 }
    if (tierOrder[a.tier] !== tierOrder[b.tier]) return tierOrder[a.tier] - tierOrder[b.tier]
    return b.winrate - a.winrate
  })

  return (
    <>
      <FadeIn>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">Champions</h1>
              <div className="flex items-center gap-1">
                {['S', 'A', 'B', 'C'].map(t => {
                  const count = filtered.filter(c => c.tier === t).length
                  const tc = TIER_STYLES[t]
                  return (
                    <span key={t} className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${tc.bg} ${tc.text} border ${tc.border}`}>
                      {t}: {count}
                    </span>
                  )
                })}
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-1">Win rate, pick rate, ban rate & trends by role</p>
          </div>
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input placeholder="Search champion..." value={search} onChange={(e) => setSearch(e.target.value)} className="h-9 pl-9 pr-4 bg-white/[0.06] border-white/[0.08] text-xs sm:w-56 placeholder:text-muted-foreground/50 focus:border-emerald-500/30" />
          </div>
        </div>
      </FadeIn>
      <FadeIn delay={0.05}>
        <RoleFilterTabs selected={roleFilter} onChange={setRoleFilter} />
      </FadeIn>
      <FadeIn delay={0.1}>
        <div className="mt-4">
          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
            {filtered.map((c, i) => (
              <StaggerItem key={c.name}><ChampionCard champ={c} index={i} /></StaggerItem>
            ))}
          </StaggerContainer>
          {filtered.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-sm">No champions found</p>
            </div>
          )}
        </div>
      </FadeIn>
    </>
  )
}

function LoLBuildsSection() {
  const featured = LOL_CHAMPIONS.find(c => c.name === 'Aatrox')!
  const rc = ROLE_COLORS[featured.role]
  return (
    <>
      <FadeIn>
        <h1 className="text-2xl font-bold tracking-tight mb-1">Builds</h1>
        <p className="text-sm text-muted-foreground mb-6">Las mejores builds basadas en datos de millones de partidas</p>
      </FadeIn>
      <FadeIn delay={0.1}>
        <Card className="border-white/[0.06] py-0 max-w-4xl">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl ${rc.bg} border ${rc.border} flex items-center justify-center text-base font-bold ${rc.text}`}>{featured.name.charAt(0)}</div>
              <div>
                <CardTitle className="text-lg">{featured.name}</CardTitle>
                <CardDescription>Build más popular · {featured.role} · {featured.winrate}% Win Rate</CardDescription>
              </div>
              <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded border ${TIER_STYLES[featured.tier].bg} ${TIER_STYLES[featured.tier].text} ${TIER_STYLES[featured.tier].border}`}>{featured.tier} Tier</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Item Build Path */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Build Path</h3>
              <div className="flex items-center gap-2">
                {LOL_ITEMS.map((item, i) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center group hover:bg-white/[0.08] transition-colors cursor-pointer relative">
                      <div className="absolute -top-1.5 -left-1.5 w-4 h-4 rounded-full bg-background border border-border flex items-center justify-center text-[9px] font-bold text-muted-foreground">{i + 1}</div>
                      <Wrench className="w-4 h-4 text-muted-foreground/40" />
                    </div>
                    {i < LOL_ITEMS.length - 1 && <ChevronRight className="w-3 h-3 text-muted-foreground/40" />}
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {LOL_ITEMS.map(item => (
                  <span key={item.name} className="text-[10px] text-muted-foreground bg-white/[0.03] px-2 py-0.5 rounded">{item.name} · <span className="text-foreground font-medium">{item.gold}g</span></span>
                ))}
              </div>
            </div>
            {/* Skill Order */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Orden de habilidades</h3>
              <div className="flex items-center gap-4">
                {['Q', 'W', 'E', 'R'].map((skill, i) => {
                  const maxed = [3, 2, 1, 0].indexOf(i) + 1
                  return (
                    <div key={skill} className="flex flex-col items-center gap-1">
                      <div className={`w-10 h-10 rounded-lg border flex items-center justify-center text-sm font-bold ${i < 3 ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'}`}>
                        {skill}
                      </div>
                      <span className="text-[10px] text-muted-foreground">Max {maxed > 0 ? maxed : '→'}</span>
                    </div>
                  )
                })}
              </div>
            </div>
            {/* Summoner Spells */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Hechizos de invocador</h3>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center text-xs font-bold text-red-400">IG</div>
                <div className="w-10 h-10 rounded-lg bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center text-xs font-bold text-yellow-400">FL</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </FadeIn>
    </>
  )
}

function LoLRunesSection() {
  const featured = LOL_CHAMPIONS.find(c => c.name === 'Orianna')!
  const rc = ROLE_COLORS[featured.role]
  return (
    <>
      <FadeIn>
        <h1 className="text-2xl font-bold tracking-tight mb-1">Runas</h1>
        <p className="text-sm text-muted-foreground mb-6">Páginas de runas más efectivas por campeón</p>
      </FadeIn>
      <FadeIn delay={0.1}>
        <Card className="border-white/[0.06] py-0 max-w-4xl">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl ${rc.bg} border ${rc.border} flex items-center justify-center text-base font-bold ${rc.text}`}>{featured.name.charAt(0)}</div>
              <div>
                <CardTitle className="text-lg">{featured.name} Runas</CardTitle>
                <CardDescription>Página más popular · {featured.winrate}% Win Rate</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Primary Tree */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Árbol Primario · Brujería</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-2.5 rounded-lg bg-emerald-500/[0.06] border border-emerald-500/20">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/15 flex items-center justify-center"><Sparkles className="w-4 h-4 text-emerald-400" /></div>
                  <div>
                    <div className="text-xs font-semibold">Cometa Arcano</div>
                    <div className="text-[10px] text-emerald-400">Keystone · 62.3% pick</div>
                  </div>
                </div>
                {[{ n: 'Banda de Maná', p: '48.1%' }, { n: 'Trascendencia', p: '51.2%' }, { n: 'Golpe de gracia', p: '54.8%' }].map(r => (
                  <div key={r.n} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/[0.02] transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-white/[0.04] flex items-center justify-center"><div className="w-3 h-3 rounded-full bg-emerald-500/30" /></div>
                    <div className="flex-1"><div className="text-xs font-medium">{r.n}</div></div>
                    <span className="text-[10px] text-muted-foreground">{r.p}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Secondary Tree */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Árbol Secundario · Precisión</h3>
              <div className="flex items-center gap-3">
                {[{ n: 'Presencia del campeón', p: '55.1%' }, { n: 'Corte fatal', p: '42.3%' }].map(r => (
                  <div key={r.n} className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.02]">
                    <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center"><div className="w-2.5 h-2.5 rounded-full bg-red-500/30" /></div>
                    <div><div className="text-[11px] font-medium">{r.n}</div><div className="text-[10px] text-muted-foreground">{r.p}</div></div>
                  </div>
                ))}
              </div>
            </div>
            {/* Stat Shards */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Fragmentos de estadísticas</h3>
              <div className="flex items-center gap-2">
                {[{ l: '+9 Fuerza adaptativa', c: 'text-red-400' }, { l: '+6 Resistencia mágica', c: 'text-cyan-400' }, { l: '+6 Velocidad', c: 'text-yellow-400' }].map(s => (
                  <span key={s.l} className={`text-[10px] font-medium px-2 py-1 rounded bg-white/[0.04] ${s.c}`}>{s.l}</span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </FadeIn>
    </>
  )
}

function LoLCountersSection() {
  const matchups = [
    { champ1: 'Aatrox', champ2: 'Darius', wr1: 54.2, wr2: 45.8, role: 'Top' },
    { champ1: 'Orianna', champ2: 'Zed', wr1: 56.1, wr2: 43.9, role: 'Mid' },
    { champ1: 'Jinx', champ2: 'Draven', wr1: 53.5, wr2: 46.5, role: 'ADC' },
    { champ1: 'Thresh', champ2: 'Yuumi', wr1: 55.8, wr2: 44.2, role: 'Support' },
    { champ1: 'Lee Sin', champ2: 'Graves', wr1: 52.7, wr2: 47.3, role: 'Jungle' },
    { champ1: 'Ahri', champ2: 'Yasuo', wr1: 57.3, wr2: 42.7, role: 'Mid' },
  ]
  return (
    <>
      <FadeIn>
        <h1 className="text-2xl font-bold tracking-tight mb-1">Counters</h1>
        <p className="text-sm text-muted-foreground mb-6">Matchups favorables y desfavorables para cada campeón</p>
      </FadeIn>
      <FadeIn delay={0.1}>
        <div className="space-y-2 max-w-4xl">
          {matchups.map(m => {
            const rc = ROLE_COLORS[m.role as LoLRole]
            return (
              <Card key={m.champ1 + m.champ2} className="border-white/[0.06] py-0">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`w-10 h-10 rounded-full ${rc.bg} border ${rc.border} flex items-center justify-center text-xs font-bold ${rc.text}`}>{m.champ1.charAt(0)}</div>
                      <div>
                        <div className="text-sm font-semibold">{m.champ1}</div>
                        <span className={`text-[10px] px-1.5 py-px rounded ${rc.bg} ${rc.text} border ${rc.border}`}>{m.role}</span>
                      </div>
                      <span className="text-xs font-bold text-emerald-400">{m.wr1}% WR</span>
                    </div>
                    <div className="px-4 text-center">
                      <div className="text-[10px] text-muted-foreground mb-1">VS</div>
                      <div className="text-xs font-bold text-foreground">{m.wr1 - m.wr2 > 0 ? '+' : ''}{(m.wr1 - m.wr2).toFixed(1)}%</div>
                    </div>
                    <div className="flex items-center gap-3 flex-1 justify-end">
                      <span className="text-xs font-bold text-rose-400">{m.wr2}% WR</span>
                      <div>
                        <div className="text-sm font-semibold text-right">{m.champ2}</div>
                      </div>
                      <div className={`w-10 h-10 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-xs font-bold text-muted-foreground`}>{m.champ2.charAt(0)}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </FadeIn>
    </>
  )
}

function LoLProBuildsSection() {
  return (
    <>
      <FadeIn>
        <h1 className="text-2xl font-bold tracking-tight mb-1">Pro Builds</h1>
        <p className="text-sm text-muted-foreground mb-6">Builds utilizadas por jugadores profesionales</p>
      </FadeIn>
      <FadeIn delay={0.1}>
        <div className="space-y-2 max-w-4xl">
          {LOL_PRO_BUILDS.map(pb => {
            const rc = ROLE_COLORS[pb.role as LoLRole]
            return (
              <Card key={pb.player} className="border-white/[0.06] py-0 group hover:border-white/[0.1] transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl ${rc.bg} border ${rc.border} flex items-center justify-center text-base font-bold ${rc.text} shrink-0`}>{pb.champion.charAt(0)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold">{pb.player}</span>
                        <span className="text-[10px] text-muted-foreground">{pb.team}</span>
                        <span className={`text-[10px] px-1.5 py-px rounded ${rc.bg} ${rc.text} border ${rc.border}`}>{pb.role}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">{pb.champion} · {pb.games} partidas</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm font-bold text-emerald-400">{pb.winrate}%</div>
                      <div className="text-[10px] text-muted-foreground">Win Rate</div>
                    </div>
                    <div className="hidden lg:flex items-center gap-1">
                      {pb.items.slice(0, 3).map((item, i) => (
                        <div key={i} className="w-8 h-8 rounded bg-white/[0.04] border border-white/[0.06] flex items-center justify-center -ml-1 first:ml-0">
                          <Wrench className="w-3 h-3 text-muted-foreground/40" />
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </FadeIn>
    </>
  )
}

function LoLTierListSection() {
  const lolGame = GAMES.find(g => g.id === 'lol')!
  return (
    <>
      <FadeIn>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Tier List</h1>
            <p className="text-sm text-muted-foreground mt-1">Parche actual · Rango Plat+ · LoL</p>
          </div>
          <Badge variant="outline" className="hidden sm:flex gap-1.5">
            <TrendingUp className="w-3.5 h-3.5" />
            Actualizado hoy
          </Badge>
        </div>
      </FadeIn>
      <FadeIn delay={0.1}>
        <Card className="overflow-hidden border-border/60 py-0">
          <div className="hidden sm:grid grid-cols-[60px_1fr_100px_100px_80px] gap-3 px-6 py-3 bg-white/[0.03] border-b border-border/60 text-xs text-muted-foreground uppercase tracking-wider font-medium">
            <div>Tier</div><div>Campeón</div><div>Win Rate</div><div>Pick Rate</div><div>Rol</div>
          </div>
          {lolGame.tierList!.map((tier) => (
            <div key={tier.tier} className="border-b border-border/40 last:border-b-0">
              <div className="hidden sm:contents">
                {tier.champions.map((champ, i) => (
                  <div key={champ.name} className="grid grid-cols-[60px_1fr_100px_100px_80px] gap-3 px-6 py-3 items-center hover:bg-white/[0.02] transition-colors">
                    {i === 0 && <div className="row-span-4 flex items-center"><Badge className={`${tier.color} border font-bold text-sm px-3`}>{tier.tier}</Badge></div>}
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold">{champ.name.charAt(0)}</div>
                      <span className="font-medium text-sm">{champ.name}</span>
                    </div>
                    <div className={`text-sm font-medium ${parseFloat(champ.winrate) >= 51 ? 'text-emerald-400' : parseFloat(champ.winrate) >= 50 ? 'text-foreground' : 'text-rose-400'}`}>{champ.winrate}</div>
                    <div className="text-sm text-muted-foreground">{champ.pick}</div>
                    <Badge variant="secondary" className="text-[10px] px-2 py-0.5 w-fit">{champ.role}</Badge>
                  </div>
                ))}
              </div>
              <div className="sm:hidden px-4 pt-3"><Badge className={`${tier.color} border font-bold text-sm px-3`}>{tier.tier}</Badge></div>
              <div className="sm:hidden grid grid-cols-2 gap-2 px-4 pb-3">
                {tier.champions.map(champ => (
                  <div key={champ.name} className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.02]">
                    <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold shrink-0">{champ.name.charAt(0)}</div>
                    <div className="min-w-0">
                      <div className="text-xs font-medium truncate">{champ.name}</div>
                      <div className="text-[10px] text-muted-foreground">{champ.winrate} · {champ.role}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </Card>
      </FadeIn>
    </>
  )
}

function LoLLeaderboardsSection() {
  const leaders = [
    { rank: 1, name: 'KR Player 1', region: 'KR', lp: 1247, winrate: 68.2, games: 342, role: 'Mid' },
    { rank: 2, name: 'EUW Challenger', region: 'EUW', lp: 1198, winrate: 65.8, games: 412, role: 'Jungle' },
    { rank: 3, name: 'NA Ace', region: 'NA', lp: 1156, winrate: 63.4, games: 289, role: 'ADC' },
    { rank: 4, name: 'CN Pro', region: 'CN', lp: 1123, winrate: 61.9, games: 367, role: 'Top' },
    { rank: 5, name: 'BR Star', region: 'BR', lp: 1089, winrate: 60.1, games: 445, role: 'Support' },
    { rank: 6, name: 'LATAM God', region: 'LAS', lp: 1045, winrate: 59.3, games: 398, role: 'Mid' },
    { rank: 7, name: 'OCE Top', region: 'OCE', lp: 1012, winrate: 58.7, games: 321, role: 'Jungle' },
    { rank: 8, name: 'TR Carry', region: 'TR', lp: 998, winrate: 57.2, games: 356, role: 'ADC' },
  ]
  return (
    <>
      <FadeIn>
        <h1 className="text-2xl font-bold tracking-tight mb-1">Leaderboards</h1>
        <p className="text-sm text-muted-foreground mb-6">Los mejores jugadores de cada región</p>
      </FadeIn>
      <FadeIn delay={0.1}>
        <Card className="border-white/[0.06] py-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-white/[0.02]">
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider w-12">#</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Jugador</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Región</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">LP</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Win Rate</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">Partidas</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">Rol</th>
                </tr>
              </thead>
              <tbody>
                {leaders.map(l => (
                  <tr key={l.rank} className="border-b border-border/30 hover:bg-white/[0.02] transition-colors">
                    <td className={`px-4 py-3 font-bold ${l.rank <= 3 ? 'text-yellow-400' : 'text-muted-foreground'}`}>{l.rank}</td>
                    <td className="px-4 py-3 font-medium">{l.name}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell"><Badge variant="outline" className="text-[10px] px-1.5 py-0.5">{l.region}</Badge></td>
                    <td className="px-4 py-3 font-bold text-emerald-400">{l.lp}</td>
                    <td className="px-4 py-3 hidden sm:table-cell"><span className={l.winrate >= 60 ? 'text-emerald-400' : 'text-foreground'}>{l.winrate}%</span></td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{l.games}</td>
                    <td className="px-4 py-3 hidden md:table-cell"><Badge variant="secondary" className="text-[10px] px-1.5 py-0.5">{l.role}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </FadeIn>
    </>
  )
}

function LoLLiveGameSection() {
  return (
    <>
      <FadeIn>
        <h1 className="text-2xl font-bold tracking-tight mb-1">Live Game</h1>
        <p className="text-sm text-muted-foreground mb-8">Analiza tu partida en tiempo real</p>
      </FadeIn>
      <FadeIn delay={0.1}>
        <Card className="max-w-md mx-auto border-dashed border-white/10 py-0">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-5">
              <Eye className="w-8 h-8 text-emerald-400/60" />
            </div>
            <h2 className="text-lg font-bold mb-2">Conecta tu cuenta</h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              Vincula tu cuenta de Riot Games para analizar partidas en vivo con win probability y recomendaciones de builds en tiempo real.
            </p>
            <Button className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold shadow-lg">
              Conectar con Riot ID
            </Button>
          </CardContent>
        </Card>
      </FadeIn>
    </>
  )
}

/* ────────────────────────────────────
   GAME DASHBOARD HOME (REUSABLE)
   ──────────────────────────────────── */

interface GameEntity {
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

interface GameRoleDef {
  id: string
  label: string
  color: string
  bgColor: string
  dotColor: string
  borderColor?: string
}

interface GameHomeConfig {
  game: Game
  entities: GameEntity[]
  roles: GameRoleDef[]
  roleColors: Record<string, { text: string; bg: string; border: string; dot: string }>
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

/* ────────────────────────────────────
   COMING SOON CONFIG & COMPONENT
   ──────────────────────────────────── */

interface ComingSoonInfo {
  gameId: GameId
  description: string
  developer: string
  genre: string
  platform: string
  status: 'Collecting Data' | 'Building Tools' | 'Beta Testing' | 'Final Polish'
  progress: number
  previewEntities: { name: string; sub: string }[]
  plannedFeatures: { icon: typeof Swords; title: string; description: string }[]
  communityStats: { label: string; value: string }[]
  estimatedLaunch: string
}

const COMING_SOON_INFO: ComingSoonInfo[] = [
  {
    gameId: 'rematch',
    description: 'The spiritual successor to classic RPG combat arenas. Rematch brings deep class customization, strategic PvP, and PvE dungeons back to the competitive scene.',
    developer: 'Hidden Variable Studios',
    genre: 'RPG / Arena Fighter',
    platform: 'PC, Mobile',
    status: 'Building Tools',
    progress: 45,
    previewEntities: [
      { name: 'Warrior', sub: 'Tank / DPS' },
      { name: 'Mage', sub: 'Ranged Burst' },
      { name: 'Ranger', sub: 'Physical DPS' },
      { name: 'Cleric', sub: 'Healer / Support' },
      { name: 'Rogue', sub: 'Assassin / Burst' },
      { name: 'Paladin', sub: 'Tank / Support' },
      { name: 'Necromancer', sub: 'Summoner' },
      { name: 'Bard', sub: 'Support / CC' },
      { name: 'Berserker', sub: 'Melee DPS' },
      { name: 'Alchemist', sub: 'Utility / DPS' },
      { name: 'Monk', sub: 'Melee / Tank' },
      { name: 'Druid', sub: 'Flex / Support' },
    ],
    plannedFeatures: [
      { icon: Swords, title: 'Class Tier Lists', description: 'Tier rankings for all classes and specs across PvP and PvE content' },
      { icon: Wrench, title: 'Build Optimizer', description: 'Stat-optimized builds with community-validated gear and skill setups' },
      { icon: Target, title: 'Matchup Analyzer', description: 'Win rates and strategies for every class vs class matchup' },
      { icon: Sparkles, title: 'Perk Calculator', description: 'Interactive perk tree planner with synergy suggestions' },
      { icon: Trophy, title: 'Leaderboards', description: 'Global and regional rankings for competitive PvP seasons' },
      { icon: Brain, title: 'AI Draft Coach', description: 'Smart team composition suggestions for PvP and dungeon runs' },
    ],
    communityStats: [
      { label: 'Waitlist signups', value: '12.4K+' },
      { label: 'Community guides', value: '850+' },
      { label: 'Beta testers', value: '2.1K' },
    ],
    estimatedLaunch: 'Q3 2025',
  },
  {
    gameId: 'wow',
    description: 'The definitive MMO analytics platform. From Mythic+ dungeon routing to raid encounter optimization and PvP tier tracking — everything a serious WoW player needs.',
    developer: 'Blizzard Entertainment',
    genre: 'MMORPG',
    platform: 'PC',
    status: 'Collecting Data',
    progress: 30,
    previewEntities: [
      { name: 'Warrior', sub: 'Arms / Fury / Prot' },
      { name: 'Paladin', sub: 'Holy / Prot / Ret' },
      { name: 'Hunter', sub: 'Beast Mastery / MM / Surv' },
      { name: 'Rogue', sub: 'Assassination / Outlaw / Sub' },
      { name: 'Priest', sub: 'Disc / Holy / Shadow' },
      { name: 'Death Knight', sub: 'Blood / Frost / Unholy' },
      { name: 'Shaman', sub: 'Elem / Enhance / Resto' },
      { name: 'Mage', sub: 'Arcane / Fire / Frost' },
      { name: 'Warlock', sub: 'Affliction / Demo / Destro' },
      { name: 'Monk', sub: 'Brewmaster / Mist / WW' },
      { name: 'Druid', sub: 'Balance / Feral / Guard / Resto' },
      { name: 'Evoker', sub: 'Devastation / Preservation' },
      { name: 'Demon Hunter', sub: 'Havoc / Vengeance' },
    ],
    plannedFeatures: [
      { icon: Swords, title: 'Talent Build Explorer', description: 'All talent builds for every spec, ranked by performance in Mythic+ and raids' },
      { icon: Target, title: 'Mythic+ Routing', description: 'Optimized routes for every dungeon with class composition suggestions' },
      { icon: Shield, title: 'Raid Encounter Guides', description: 'Boss-by-boss strategies with spec-specific tips and gear checks' },
      { icon: Users, title: 'PvP Tier List', description: 'Arena and BG tier rankings by spec with comp analysis' },
      { icon: BarChart3, title: 'WCL Integration', description: 'Warcraft Logs data for parse analysis and performance benchmarking' },
      { icon: Eye, title: 'Live Raid Tracking', description: 'Real-time raid progress tracking with wipe analysis' },
    ],
    communityStats: [
      { label: 'WoW players interested', value: '45.2K+' },
      { label: 'WCL logs parsed', value: '2.8M+' },
      { label: 'Beta requests', value: '18.7K' },
    ],
    estimatedLaunch: 'Q4 2025',
  },
  {
    gameId: 'helldivers2',
    description: 'For Democracy! Comprehensive weapon stats, stratagem tier lists, enemy weakness databases, and mission optimizers for the ultimate Helldivers experience.',
    developer: 'Arrowhead Game Studios',
    genre: 'Co-op Shooter',
    platform: 'PC, PS5',
    status: 'Beta Testing',
    progress: 65,
    previewEntities: [
      { name: 'Liberator', sub: 'Assault Rifle' },
      { name: 'Breaker', sub: 'Shotgun' },
      { name: 'Anti-Materiel Rifle', sub: 'Sniper' },
      { name: 'Railgun', sub: 'Exotic' },
      { name: 'Spear', sub: 'Launcher' },
      { name: 'Autocannon', sub: 'Heavy' },
      { name: 'Laser Cannon', sub: 'Energy' },
      { name: 'Gattling Cannon', sub: 'Heavy' },
    ],
    plannedFeatures: [
      { icon: Swords, title: 'Weapon Tier List', description: 'Complete weapon rankings with DPS calculations and ammo efficiency' },
      { icon: Wrench, title: 'Loadout Builder', description: 'Create and share optimized loadouts for every mission difficulty' },
      { icon: Target, title: 'Enemy Database', description: 'Weakness charts, HP pools, and effective strategies for every enemy type' },
      { icon: Sparkles, title: 'Stratagem Guide', description: 'Detailed stratagem usage tips and cooldown optimization' },
      { icon: BarChart3, title: 'Mission Analytics', description: 'Success rates and optimal approaches for all operation types' },
      { icon: Users, title: 'Squad Finder', description: 'Find teammates for specific operations and difficulty levels' },
    ],
    communityStats: [
      { label: 'Helldivers interested', value: '28.3K+' },
      { label: 'Weapons tested', value: '85' },
      { label: 'Stratagem guides', value: '42' },
    ],
    estimatedLaunch: 'Q2 2025',
  },
  {
    gameId: '2xko',
    description: 'Riot Games\' tag-team fighting game. Frame data, combo notation, tier lists, and matchup knowledge — everything a fighting game competitor needs.',
    developer: 'Riot Games',
    genre: 'Fighting Game',
    platform: 'PC, PS5, Xbox, Mobile',
    status: 'Final Polish',
    progress: 80,
    previewEntities: [
      { name: 'Ahri', sub: 'Rushdown' },
      { name: 'Darius', sub: 'Grappler / Power' },
      { name: 'Ekko', sub: 'Rushdown / Mix-up' },
      { name: 'Illaoi', sub: 'Zoner / Power' },
      { name: 'Jinx', sub: 'Zoner / Ranged' },
      { name: 'Katarina', sub: 'Rushdown' },
      { name: 'LeBlanc', sub: 'Mix-up / Trickster' },
      { name: 'Malphite', sub: 'Grappler / Tank' },
      { name: 'Sett', sub: 'Grappler / Brawler' },
      { name: 'Twisted Fate', sub: 'Puppeteer / Zoner' },
      { name: 'Yasuo', sub: 'Rushdown / Iaijutsu' },
      { name: 'Zoe', sub: 'Tricky / Zoner' },
    ],
    plannedFeatures: [
      { icon: Swords, title: 'Fighter Tier List', description: 'Ranked tier lists for every fighter across all skill brackets' },
      { icon: BarChart3, title: 'Frame Data Tool', description: 'Complete frame data for every move, startup, active, recovery' },
      { icon: Wrench, title: 'Combo Library', description: 'Community-submitted combos with notation and video references' },
      { icon: Target, title: 'Matchup Charts', description: 'Who wins each matchup and why, with specific strategy notes' },
      { icon: Brain, title: 'AI Lab Partner', description: 'Practice specific scenarios and punish windows with AI assistance' },
      { icon: Trophy, title: 'Tournament Tracker', description: 'Track competitive results, top players, and meta evolution' },
    ],
    communityStats: [
      { label: 'FGC players interested', value: '35.1K+' },
      { label: 'Combo submissions', value: '1.2K+' },
      { label: 'Open beta testers', value: '5.8K' },
    ],
    estimatedLaunch: '2025',
  },
]

function ComingSoonSection({ game, onBack }: { game: Game; onBack: () => void }) {
  const info = COMING_SOON_INFO.find(i => i.gameId === game.id)
  const accent = ACCENT_MAP[game.accentColor] || ACCENT_MAP.emerald
  const Icon = game.icon

  const statusColorMap: Record<string, string> = {
    'Collecting Data': 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    'Building Tools': 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
    'Beta Testing': 'bg-violet-500/15 text-violet-400 border-violet-500/30',
    'Final Polish': 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  }
  const statusDotMap: Record<string, string> = {
    'Collecting Data': 'bg-amber-400',
    'Building Tools': 'bg-cyan-400',
    'Beta Testing': 'bg-violet-400',
    'Final Polish': 'bg-emerald-400',
  }

  if (!info) return null

  return (
    <>
      {/* ── Hero Banner ── */}
      <FadeIn>
        <div className="relative rounded-xl overflow-hidden mb-5">
          <div className={`absolute inset-0 bg-gradient-to-br ${accent.gradient}`} />
          <div className="absolute inset-0 bg-[#09090b]/40" />
          <div className="absolute top-3 right-3 opacity-[0.06]">
            <Icon className="w-40 h-40" />
          </div>
          <div className="relative z-10 p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${accent.bg} border ${accent.border} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${accent.text}`} />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-lg font-bold tracking-tight">{game.name}</h1>
                    <Badge className={`${statusColorMap[info.status]} text-[9px] font-semibold px-1.5 py-0 border`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusDotMap[info.status]} mr-1 animate-pulse`} />
                      {info.status}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{game.tagline}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <div className="text-[10px] text-muted-foreground">Est. Launch</div>
                  <div className="text-xs font-semibold">{info.estimatedLaunch}</div>
                </div>
                <Button variant="outline" size="sm" className="gap-1.5 h-7 text-[11px]" onClick={onBack}>
                  <HomeIcon className="w-3 h-3" />All Games
                </Button>
              </div>
            </div>
          </div>
        </div>
      </FadeIn>

      {/* ── Progress Bar ── */}
      <FadeIn delay={0.05}>
        <div className="mb-5 p-3 rounded-lg bg-white/[0.02] border border-white/[0.05]">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Development Progress</span>
            <span className={`text-[11px] font-bold ${accent.text}`}>{info.progress}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${accent.primary}`}
              initial={{ width: 0 }}
              animate={{ width: `${info.progress}%` }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
            />
          </div>
          <div className="flex items-center gap-4 mt-2">
            <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Gamepad2 className="w-3 h-3" />{info.genre}</span>
            <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Globe className="w-3 h-3" />{info.platform}</span>
            <span className="text-[10px] text-muted-foreground hidden sm:flex items-center gap-1"><Users className="w-3 h-3" />{info.developer}</span>
          </div>
        </div>
      </FadeIn>

      {/* ── Description ── */}
      <FadeIn delay={0.07}>
        <p className="text-sm text-muted-foreground leading-relaxed mb-5">{info.description}</p>
      </FadeIn>

      {/* ── Quick Stats Strip ── */}
      <FadeIn delay={0.08}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-5">
          {game.features.map((feat) => (
            <div key={feat.title} className={`flex items-center gap-2 p-2.5 rounded-lg ${accent.bg} hover:bg-white/[0.04] transition-all`}>
              <div className="min-w-0 flex-1">
                <div className={`text-sm font-bold ${accent.text} leading-tight`}>{feat.stat}</div>
                <div className="text-[10px] text-muted-foreground truncate">{feat.title}</div>
              </div>
            </div>
          ))}
        </div>
      </FadeIn>

      {/* ── Two-column layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: Preview Entities + Planned Features */}
        <div className="lg:col-span-2 space-y-4">
          {/* Preview Entities */}
          <FadeIn delay={0.1}>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.01] overflow-hidden">
              <div className="px-4 py-3 border-b border-white/[0.04] bg-white/[0.02]">
                <h2 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Compass className="w-3 h-3" />
                  Preview — {info.previewEntities.length} {info.gameId === 'helldivers2' ? 'Weapons' : info.gameId === '2xko' ? 'Fighters' : info.gameId === 'wow' ? 'Classes' : 'Classes'}
                </h2>
              </div>
              <div className="p-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5">
                {info.previewEntities.map((entity, idx) => (
                  <motion.div
                    key={entity.name}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.12 + idx * 0.03 }}
                    className="group flex items-center gap-2 p-2 rounded-lg bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] hover:border-white/[0.08] transition-all cursor-pointer"
                  >
                    <div className={`w-7 h-7 rounded-lg ${accent.bg} border ${accent.border} flex items-center justify-center text-[10px] font-bold ${accent.text} shrink-0 group-hover:scale-105 transition-transform`}>
                      {entity.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] font-semibold truncate leading-tight">{entity.name}</div>
                      <div className="text-[9px] text-muted-foreground truncate">{entity.sub}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </FadeIn>

          {/* Planned Features */}
          <FadeIn delay={0.15}>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.01] overflow-hidden">
              <div className="px-4 py-3 border-b border-white/[0.04] bg-white/[0.02]">
                <h2 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3" />
                  Planned Features
                </h2>
              </div>
              <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {info.plannedFeatures.map((feature, idx) => {
                  const FeatureIcon = feature.icon
                  return (
                    <motion.div
                      key={feature.title}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.17 + idx * 0.04 }}
                      className="group flex items-start gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] hover:border-white/[0.08] transition-all"
                    >
                      <div className={`w-8 h-8 rounded-lg ${accent.bg} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                        <FeatureIcon className={`w-4 h-4 ${accent.text}`} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold leading-tight mb-0.5">{feature.title}</div>
                        <div className="text-[10px] text-muted-foreground leading-relaxed">{feature.description}</div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </FadeIn>
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          {/* Community Stats */}
          <FadeIn delay={0.12}>
            <div className={`rounded-xl border ${accent.border} ${accent.bg} overflow-hidden`}>
              <div className={`px-3 py-2 border-b ${accent.border} bg-white/[0.02]`}>
                <h3 className="text-[10px] font-semibold flex items-center gap-1 ${accent.text} uppercase tracking-wider">
                  <Users className="w-3 h-3" />
                  Community
                </h3>
              </div>
              <div className="p-2 space-y-0.5">
                {info.communityStats.map((stat, i) => (
                  <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/[0.04] transition-colors">
                    <span className="text-[10px] text-muted-foreground">{stat.label}</span>
                    <span className={`text-[11px] font-bold ${accent.text}`}>{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>

          {/* Notify me */}
          <FadeIn delay={0.14}>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
              <div className="px-3 py-2 border-b border-white/[0.04] bg-white/[0.02]">
                <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Get Notified</h3>
              </div>
              <div className="p-3 space-y-2">
                <p className="text-[10px] text-muted-foreground">Be the first to know when {game.shortName} tools launch.</p>
                <div className="flex gap-1.5">
                  <Input placeholder="your@email.com" className="h-7 text-[10px] bg-white/[0.03] border-white/[0.06] placeholder:text-muted-foreground/40" />
                  <Button size="sm" className={`${accent.button} ${accent.buttonHover} text-black font-bold h-7 text-[10px] px-2.5 shrink-0`}>
                    <ArrowRight className="w-3 h-3" />
                  </Button>
                </div>
                <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground/60">
                  <Check className="w-3 h-3 text-emerald-400" />
                  No spam. Unsubscribe anytime.
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Game info */}
          <FadeIn delay={0.16}>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
              <div className="px-3 py-2 border-b border-white/[0.04] bg-white/[0.02]">
                <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Game Info</h3>
              </div>
              <div className="p-2 space-y-0.5">
                <div className="flex items-center justify-between px-3 py-1.5">
                  <span className="text-[10px] text-muted-foreground">Developer</span>
                  <span className="text-[10px] font-medium">{info.developer}</span>
                </div>
                <div className="flex items-center justify-between px-3 py-1.5">
                  <span className="text-[10px] text-muted-foreground">Genre</span>
                  <span className="text-[10px] font-medium">{info.genre}</span>
                </div>
                <div className="flex items-center justify-between px-3 py-1.5">
                  <span className="text-[10px] text-muted-foreground">Platform</span>
                  <span className="text-[10px] font-medium">{info.platform}</span>
                </div>
                <div className="flex items-center justify-between px-3 py-1.5">
                  <span className="text-[10px] text-muted-foreground">Launch</span>
                  <span className={`text-[10px] font-bold ${accent.text}`}>{info.estimatedLaunch}</span>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>

      {/* ── CTA ── */}
      <FadeIn delay={0.2} className="mt-6">
        <div className={`flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-lg ${accent.bg} ${accent.border} border`}>
          <div className="text-center sm:text-left">
            <h2 className="text-xs font-bold">Want early access?</h2>
            <p className="text-[10px] text-muted-foreground mt-0.5">Sign up for the {game.shortName} beta and shape the tools with your feedback.</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button size="sm" className={`${accent.button} ${accent.buttonHover} text-black font-bold h-7 text-[11px] px-3`}>
              Join Waitlist <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
            <Button variant="ghost" size="sm" className="h-7 text-[11px] gap-1" onClick={onBack}>
              Explore other games
            </Button>
          </div>
        </div>
      </FadeIn>
    </>
  )
}

/* ────────────────────────────────────
   LIVE DATA INDICATOR + LOADING SKELETON
   ──────────────────────────────────── */

function LiveIndicator({ lastUpdated, source, isLoading, onRefresh }: { lastUpdated: number; source?: string; isLoading?: boolean; onRefresh?: () => void }) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onRefresh}
        disabled={isLoading}
        className="flex items-center gap-1.5 text-[9px] text-muted-foreground/70 hover:text-foreground transition-colors cursor-pointer disabled:cursor-wait"
      >
        {isLoading ? (
          <Loader2 className="w-3 h-3 animate-spin text-cyan-400" />
        ) : (
          <Wifi className="w-3 h-3 text-emerald-400" />
        )}
        <span>Live</span>
        <span className="text-muted-foreground/40">·</span>
        <span>{formatLastUpdated(lastUpdated)}</span>
      </button>
      {source && (
        <span className="text-[8px] text-muted-foreground/30 hidden sm:inline truncate max-w-[120px]">{source}</span>
      )}
    </div>
  )
}

function DashboardLoadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Hero banner skeleton */}
      <div className="h-24 rounded-xl bg-white/[0.03] border border-white/[0.04]" />
      {/* Stats strip */}
      <div className="grid grid-cols-4 gap-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-14 rounded-lg bg-white/[0.03] border border-white/[0.04]" />
        ))}
      </div>
      {/* Role strip */}
      <div className="h-12 rounded-lg bg-white/[0.03] border border-white/[0.04]" />
      {/* Entity list */}
      <div className="rounded-xl border border-white/[0.04] bg-white/[0.01] divide-y divide-white/[0.02]">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3">
            <div className="w-8 h-8 rounded-full bg-white/[0.04]" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 w-24 rounded bg-white/[0.04]" />
              <div className="h-2 w-16 rounded bg-white/[0.03]" />
            </div>
            <div className="h-3 w-10 rounded bg-white/[0.04]" />
          </div>
        ))}
      </div>
      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        <div className="lg:col-span-2 h-64 rounded-xl bg-white/[0.03] border border-white/[0.04]" />
        <div className="space-y-3">
          <div className="h-32 rounded-xl bg-white/[0.03] border border-white/[0.04]" />
          <div className="h-32 rounded-xl bg-white/[0.03] border border-white/[0.04]" />
        </div>
      </div>
    </div>
  )
}

/* ────────────────────────────────────
   DASHBOARD CHARTS (Recharts)
   ──────────────────────────────────── */

const CHART_COLORS = ['#facc15', '#34d399', '#60a5fa', '#a78bfa', '#f87171', '#fb923c', '#2dd4bf', '#f472b6']

function DashboardCharts({ entities, entityLabel, accent, roleColors, showPlacement }: {
  entities: GameEntity[]
  entityLabel: string
  accent: typeof ACCENT_MAP.emerald
  roleColors: Record<string, { text: string; bg: string; border: string; dot: string }>
  showPlacement?: boolean
}) {
  // Top 8 entities by win rate for bar chart
  const topEntities = useMemo(() =>
    [...entities].sort((a, b) => {
      const va = showPlacement ? (a.placementRate || a.winrate) : a.winrate
      const vb = showPlacement ? (b.placementRate || b.winrate) : b.winrate
      return vb - va
    }).slice(0, 8).map(e => ({
      name: e.name.length > 10 ? e.name.slice(0, 9) + '…' : e.name,
      fullName: e.name,
      value: showPlacement ? (e.placementRate || e.winrate) : e.winrate,
      tier: e.tier,
      role: e.role,
    })), [entities, showPlacement])

  // Tier distribution for pie chart
  const tierDist = useMemo(() => {
    const counts: Record<string, number> = { S: 0, A: 0, B: 0, C: 0 }
    entities.forEach(e => { if (counts[e.tier] !== undefined) counts[e.tier]++ })
    return Object.entries(counts).map(([tier, count]) => ({ name: `${tier}-Tier`, value: count, tier }))
  }, [entities])

  // Role distribution for pie chart
  const roleOnlyDefs = Object.keys(roleColors).filter(k => k !== 'All' && roleColors[k])
  const roleDist = useMemo(() =>
    roleOnlyDefs.map(role => ({
      name: role,
      value: entities.filter(e => e.role === role).length,
      color: roleColors[role]?.dot || '#888',
    })).filter(d => d.value > 0), [entities, roleOnlyDefs, roleColors])

  // Simulated trend data for area chart
  const trendData = useMemo(() => {
    const labels = ['7d ago', '6d ago', '5d ago', '4d ago', '3d ago', '2d ago', 'Yesterday', 'Today']
    return labels.map((label, i) => ({
      label,
      winRate: +(49.5 + Math.sin(i * 0.8) * 1.2 + (i / labels.length) * 1.5).toFixed(1),
      pickRate: +(10 + Math.cos(i * 0.6) * 2 + (i / labels.length) * 1).toFixed(1),
    }))
  }, [])

  const tierColorMap: Record<string, string> = { S: '#facc15', A: '#34d399', B: '#60a5fa', C: '#a78bfa' }

  return (
    <FadeIn delay={0.12} className="mt-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-bold flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          Analytics Overview
        </h2>
        <Badge variant="outline" className="text-[9px] gap-1">
          <Layers className="w-2.5 h-2.5" />
          Live data
        </Badge>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* Win Rate Bar Chart */}
        <div className="lg:col-span-2 rounded-xl border border-white/[0.06] bg-white/[0.01] overflow-hidden">
          <div className="px-4 py-2.5 border-b border-white/[0.04] bg-white/[0.02]">
            <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Top {entityLabel.charAt(0).toUpperCase() + entityLabel.slice(1)} — {showPlacement ? 'Top 4 Rate' : 'Win Rate'} %
            </h3>
          </div>
          <div className="p-3">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={topEntities} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                <XAxis type="number" domain={showPlacement ? [15, 35] : [47, 55]} tick={{ fontSize: 10, fill: '#71717a' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#a1a1aa' }} width={65} axisLine={false} tickLine={false} />
                <RechartsTooltip
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', fontSize: '11px', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}
                  labelStyle={{ color: '#e4e4e7', fontWeight: 600 }}
                  formatter={(value: number, name: string) => [`${value}%`, name === 'value' ? (showPlacement ? 'Top 4 Rate' : 'Win Rate') : name]}
                  labelFormatter={(label: string) => {
                    const found = topEntities.find(t => t.name === label)
                    return found?.fullName || label
                  }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={18}>
                  {topEntities.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={tierColorMap[entry.tier] || accent.primary.replace('bg-', '#')} fillOpacity={0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tier Distribution Pie + Role Split */}
        <div className="space-y-3">
          {/* Tier Distribution */}
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.01] overflow-hidden">
            <div className="px-4 py-2.5 border-b border-white/[0.04] bg-white/[0.02]">
              <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Tier Distribution</h3>
            </div>
            <div className="p-3 flex items-center gap-3">
              <ResponsiveContainer width={90} height={90}>
                <PieChart>
                  <Pie data={tierDist} cx="50%" cy="50%" innerRadius={25} outerRadius={42} paddingAngle={3} dataKey="value" stroke="none">
                    {tierDist.map((entry, index) => (
                      <Cell key={`tier-${index}`} fill={tierColorMap[entry.tier] || '#888'} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', fontSize: '11px' }}
                    formatter={(value: number) => [`${value} ${entityLabel}`, 'Count']}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5">
                {tierDist.map(t => (
                  <div key={t.tier} className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-sm shrink-0" style={{ backgroundColor: tierColorMap[t.tier] }} />
                    <span className="text-[10px] text-muted-foreground flex-1">{t.name}</span>
                    <span className="text-[10px] font-bold" style={{ color: tierColorMap[t.tier] }}>{t.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Role Composition */}
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.01] overflow-hidden">
            <div className="px-4 py-2.5 border-b border-white/[0.04] bg-white/[0.02]">
              <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Role Composition</h3>
            </div>
            <div className="p-3">
              <div className="space-y-1.5">
                {roleDist.slice(0, 5).map(r => {
                  const pct = (r.value / entities.length) * 100
                  return (
                    <div key={r.name}>
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-[10px] text-muted-foreground">{r.name}</span>
                        <span className="text-[10px] font-bold">{r.value} ({pct.toFixed(0)}%)</span>
                      </div>
                      <div className="w-full h-1 rounded-full bg-white/[0.06] overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ backgroundColor: r.color }}
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Trend Area Chart (full width) */}
        <div className="md:col-span-2 lg:col-span-3 rounded-xl border border-white/[0.06] bg-white/[0.01] overflow-hidden">
          <div className="px-4 py-2.5 border-b border-white/[0.04] bg-white/[0.02]">
            <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Timer className="w-3 h-3" />
              Meta Trend — Last 7 Days
            </h3>
          </div>
          <div className="p-3">
            <ResponsiveContainer width="100%" height={140}>
              <AreaChart data={trendData} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="wrGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={accent.text.includes('emerald') ? '#34d399' : '#f87171'} stopOpacity={0.15} />
                    <stop offset="95%" stopColor={accent.text.includes('emerald') ? '#34d399' : '#f87171'} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="label" tick={{ fontSize: 9, fill: '#71717a' }} axisLine={false} tickLine={false} />
                <YAxis domain={['dataMin - 0.5', 'dataMax + 0.5']} tick={{ fontSize: 9, fill: '#71717a' }} axisLine={false} tickLine={false} width={32} />
                <RechartsTooltip
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', fontSize: '11px', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}
                  formatter={(value: number, name: string) => [`${value}%`, name === 'winRate' ? 'Avg Win Rate' : 'Avg Pick Rate']}
                />
                <Area type="monotone" dataKey="winRate" stroke={accent.text.includes('emerald') ? '#34d399' : '#f87171'} strokeWidth={2} fill="url(#wrGrad)" dot={{ r: 3, fill: accent.text.includes('emerald') ? '#34d399' : '#f87171', strokeWidth: 0 }} />
                <Area type="monotone" dataKey="pickRate" stroke="#60a5fa" strokeWidth={1.5} fill="none" strokeDasharray="4 4" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </FadeIn>
  )
}

function GameDashboardHome({ config, lastUpdated, source, isLoading, onRefresh }: { config: GameHomeConfig; lastUpdated?: number; source?: string; isLoading?: boolean; onRefresh?: () => void }) {
  const { game, entities, roles, roleColors, patchLabel, searchPlaceholder, entityLabel, entityIcon, secondaryStatLabel, showKda, showPlacement, showBanRate, metaInsights } = config
  const accent = ACCENT_MAP[game.accentColor] || ACCENT_MAP.emerald
  const Icon = game.icon

  const [roleFilter, setRoleFilter] = useState<string>('All')
  const [search, setSearch] = useState('')

  const filtered = entities.filter(e => {
    if (roleFilter !== 'All' && e.role !== roleFilter) return false
    if (search && !e.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  }).sort((a, b) => {
    const tierOrder: Record<string, number> = { S: 0, A: 1, B: 2, C: 3 }
    if (tierOrder[a.tier] !== tierOrder[b.tier]) return tierOrder[a.tier] - tierOrder[b.tier]
    return b.winrate - a.winrate
  })

  // Quick stats
  const bestWR = entities.reduce((a, b) => a.winrate > b.winrate ? a : b)
  const mostPicked = entities.reduce((a, b) => a.pickrate > b.pickrate ? a : b)
  const sTierCount = entities.filter(e => e.tier === 'S').length
  const trending = entities.filter(e => e.trend === 'up').sort((a, b) => b.trendChange - a.trendChange).slice(0, 6)

  // Best entity per role (skip 'All')
  const roleOnlyDefs = roles.filter(r => r.id !== 'All')
  const bestByRole = roleOnlyDefs.map(rd => {
    const ents = entities.filter(e => e.role === rd.id)
    if (ents.length === 0) return null
    const best = ents.reduce((a, b) => a.winrate > b.winrate ? a : b)
    return { ...best, roleColor: roleColors[best.role] || roleColors[rd.id] }
  }).filter(Boolean) as (GameEntity & { roleColor: { text: string; bg: string; border: string; dot: string } })[]

  // S-tier entities
  const sTierEntities = entities.filter(e => e.tier === 'S')

  return (
    <>
      {/* ── Hero Banner ── */}
      <FadeIn>
        <div className={`relative rounded-xl overflow-hidden mb-5`}>
          <div className={`absolute inset-0 bg-gradient-to-br ${accent.gradient}`} />
          <div className="absolute inset-0 bg-[#09090b]/40" />
          <div className="absolute top-4 right-4 opacity-[0.06]">
            <Icon className="w-32 h-32" />
          </div>
          <div className="relative z-10 p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg ${accent.bg} border ${accent.border} flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 ${accent.text}`} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-base font-bold tracking-tight">{game.name}</h1>
                    <Badge className={`${accent.bg} ${accent.text} ${accent.border} text-[9px] font-semibold px-1.5 py-0`}>{patchLabel}</Badge>
                    {lastUpdated && (
                      <LiveIndicator lastUpdated={lastUpdated} source={source} isLoading={isLoading} onRefresh={onRefresh} />
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground">{game.tagline}</p>
                </div>
              </div>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                <Input
                  placeholder={searchPlaceholder}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className={`h-7 pl-7 pr-3 bg-white/[0.04] border-white/[0.06] text-xs w-full sm:w-48 placeholder:text-muted-foreground/40 focus:${accent.border}`}
                />
              </div>
            </div>
          </div>
        </div>
      </FadeIn>

      {/* ── Quick Stats Strip ── */}
      <FadeIn delay={0.05}>
        <div className="grid grid-cols-4 gap-2 mb-5">
          {[
            { label: 'Best Win Rate', value: `${bestWR.winrate}%`, sub: bestWR.name, role: bestWR.role, icon: Flame, color: 'text-emerald-400', bg: 'bg-emerald-500/[0.04]' },
            { label: 'Most Picked', value: `${mostPicked.pickrate}%`, sub: mostPicked.name, role: mostPicked.role, icon: Target, color: 'text-cyan-400', bg: 'bg-cyan-500/[0.04]' },
            { label: `S-Tier ${entityLabel}`, value: `${sTierCount}`, sub: `${sTierCount} top picks`, role: null, icon: Crown, color: 'text-yellow-400', bg: 'bg-yellow-500/[0.04]' },
            { label: 'Trending Up', value: `${trending.length}+`, sub: `${entityLabel} rising`, role: null, icon: ArrowUpRight, color: accent.text, bg: accent.bg },
          ].map(s => {
            const rc = s.role ? roleColors[s.role] : null
            return (
              <div key={s.label} className={`group flex items-center gap-2 p-2 rounded-lg ${s.bg} hover:bg-white/[0.04] transition-all cursor-pointer`}>
                <s.icon className={`w-3.5 h-3.5 ${s.color} shrink-0`} />
                <div className="min-w-0 flex-1">
                  <div className={`text-xs font-bold ${s.color} leading-tight`}>{s.value}</div>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-muted-foreground truncate">{s.sub}</span>
                    {rc && <span className={`text-[8px] px-0.5 py-px rounded font-semibold ${rc.bg} ${rc.text} border ${rc.border}`}>{s.role}</span>}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </FadeIn>

      {/* ── Best Entity per Role Strip ── */}
      {bestByRole.length > 0 && (
        <FadeIn delay={0.07}>
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Star className="w-3 h-3 text-yellow-400" />
                Best in Each Role
              </h2>
            </div>
            <div className={`grid gap-1.5 ${bestByRole.length <= 5 ? 'grid-cols-5' : bestByRole.length <= 6 ? 'grid-cols-3 sm:grid-cols-6' : 'grid-cols-3 sm:grid-cols-4 lg:grid-cols-6'}`}>
              {bestByRole.map(({ role, name, winrate, roleColor }) => {
                if (!roleColor) return null
                return (
                  <button
                    key={role}
                    onClick={() => setRoleFilter(role)}
                    className={`group flex items-center gap-2 p-2 rounded-lg border transition-all cursor-pointer ${
                      roleFilter === role
                        ? `${roleColor.bg} ${roleColor.border} border`
                        : 'bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.04] hover:border-white/[0.1]'
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-full ${roleColor.bg} border ${roleColor.border} flex items-center justify-center text-[10px] font-bold ${roleColor.text} shrink-0 group-hover:scale-105 transition-transform`}>
                      {entityIcon || name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] font-semibold truncate leading-tight">{name}</div>
                      <div className="text-[9px] text-muted-foreground">
                        {showPlacement ? `${winrate}% top4` : `${winrate}%`}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </FadeIn>
      )}

      {/* ── Role Filter Tabs + Entity List ── */}
      <FadeIn delay={0.1}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-0.5 overflow-x-auto no-scrollbar">
            {roles.map((role) => {
              const isActive = roleFilter === role.id
              const isAll = role.id === 'All'
              return (
                <button
                  key={role.id}
                  onClick={() => setRoleFilter(role.id)}
                  className={`relative flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap transition-all duration-150 cursor-pointer shrink-0 ${
                    isActive
                      ? 'bg-white/[0.08] text-foreground'
                      : 'text-muted-foreground/60 hover:text-foreground hover:bg-white/[0.04]'
                  }`}
                >
                  {!isAll && role.dotColor && <span className={`w-1.5 h-1.5 rounded-full ${role.dotColor} ${isActive ? 'shadow-sm' : 'opacity-40'}`} />}
                  {role.label}
                  {isActive && <motion.div layoutId={`gdh-tab-${game.id}`} className={`absolute bottom-0 left-1 right-1 h-0.5 ${accent.primary} rounded-full`} transition={{ type: 'spring', stiffness: 400, damping: 30 }} />}
                </button>
              )
            })}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground whitespace-nowrap">{filtered.length} {entityLabel}</span>
            <div className="flex items-center gap-0.5">
              {['S', 'A', 'B', 'C'].map(t => {
                const count = filtered.filter(e => e.tier === t).length
                const tc = TIER_STYLES[t]
                return (
                  <span key={t} className={`text-[9px] font-bold px-1 py-0.5 rounded ${tc.bg} ${tc.text} border ${tc.border}`}>
                    {t}: {count}
                  </span>
                )
              })}
            </div>
          </div>
        </div>
        <StaggerContainer className="rounded-xl border border-white/[0.06] bg-white/[0.01] overflow-hidden divide-y divide-white/[0.03]">
          {filtered.map((entity, i) => {
            const rc = roleColors[entity.role] || { text: 'text-muted-foreground', bg: 'bg-white/10', border: 'border-white/[0.1]', dot: 'bg-muted-foreground' }
            const ts = TIER_STYLES[entity.tier]
            const wrColor = entity.winrate >= 52 ? 'text-emerald-400' : entity.winrate >= 50 ? 'text-foreground' : 'text-rose-400'
            const tierDotColor = entity.tier === 'S' ? 'bg-yellow-400' : entity.tier === 'A' ? 'bg-emerald-400' : entity.tier === 'B' ? 'bg-blue-400' : 'bg-violet-400'
            const TrendIcon = entity.trend === 'up' ? ChevronRight : entity.trend === 'down' ? ChevronLeft : null
            const trendColor = entity.trend === 'up' ? 'text-emerald-400' : entity.trend === 'down' ? 'text-rose-400' : 'text-muted-foreground'
            const isSTier = entity.tier === 'S'
            const displayValue = showPlacement ? entity.placementRate || entity.winrate : entity.winrate
            const displayLabel = showPlacement ? 'Top4' : 'WR'

            return (
              <StaggerItem key={entity.name}>
                <div className={`group flex items-center gap-2.5 px-3 py-2 hover:bg-white/[0.03] transition-all cursor-pointer border-b border-transparent hover:border-white/[0.04] ${isSTier ? 'border-l-2 border-l-yellow-500/30' : ''}`}>
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <div className={`w-8 h-8 rounded-full ${rc.bg} border ${rc.border} flex items-center justify-center text-xs font-bold ${rc.text} group-hover:scale-105 transition-transform ${isSTier ? 'ring-1 ring-yellow-500/20' : ''}`}>
                      {entityIcon || entity.name.charAt(0)}
                    </div>
                    <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ${tierDotColor} border-2 border-[#09090b] flex items-center justify-center`}>
                      <span className="text-[6px] font-black text-black leading-none">{entity.tier}</span>
                    </span>
                  </div>
                  {/* Name + role + carry units */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold truncate group-hover:text-foreground transition-colors">{entity.name}</span>
                      <span className={`text-[9px] px-1 py-px rounded font-medium ${rc.bg} ${rc.text} border ${rc.border} leading-none`}>{entity.role}</span>
                      {entity.difficulty && (
                        <span className={`text-[8px] px-1 py-px rounded font-medium leading-none ${entity.difficulty === 'Easy' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : entity.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                          {entity.difficulty}
                        </span>
                      )}
                    </div>
                    {entity.carryUnits && entity.carryUnits.length > 0 && (
                      <div className="flex items-center gap-0.5 mt-0.5">
                        {entity.carryUnits.slice(0, 3).map((u) => (
                          <span key={u} className="text-[8px] text-muted-foreground/60 bg-white/[0.03] px-1 py-px rounded">{u}</span>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-[11px] font-bold ${wrColor}`}>{displayValue}%</span>
                      <WinRateBar value={displayValue} max={showPlacement ? 35 : 55} min={showPlacement ? 15 : 45} />
                      <span className="text-[9px] text-muted-foreground/40">{displayLabel}</span>
                    </div>
                  </div>
                  {/* Stats */}
                  <div className="text-right shrink-0 flex items-center gap-2">
                    {showKda && entity.kda && (
                      <span className="text-[10px] text-muted-foreground hidden sm:inline">{secondaryStatLabel || 'KDA'}: {entity.kda}</span>
                    )}
                    {showBanRate && entity.banrate && (
                      <span className="text-[10px] text-muted-foreground/60 hidden md:inline">{entity.banrate}% BR</span>
                    )}
                    <span className="text-[10px] text-muted-foreground hidden sm:inline">{entity.pickrate}% PR</span>
                    {TrendIcon && <span className={`text-[10px] font-semibold ${trendColor} flex items-center gap-0.5`}><TrendIcon className="w-2.5 h-2.5" />{entity.trendChange > 0 ? '+' : ''}{entity.trendChange}%</span>}
                  </div>
                </div>
              </StaggerItem>
            )
          })}
        </StaggerContainer>
        {filtered.length === 0 && (
          <div className="text-center py-12 mt-4">
            <p className="text-muted-foreground text-sm">No {entityLabel} found</p>
          </div>
        )}
      </FadeIn>

      {/* ── Recharts Analytics ── */}
      <DashboardCharts entities={entities} entityLabel={entityLabel} accent={accent} roleColors={roleColors} showPlacement={showPlacement} />

      {/* ── Patch Trends + Meta Insights ── */}
      <FadeIn delay={0.15} className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            Patch Trends
          </h2>
          <Badge variant="outline" className="text-[9px] gap-1">
            <TrendingUp className="w-2.5 h-2.5" />
            Last 7 days
          </Badge>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {/* Trending entities list */}
          <div className="lg:col-span-2">
            <div className="rounded-lg border border-white/[0.06] bg-white/[0.01] overflow-hidden">
              <div className="px-3 py-2 border-b border-white/[0.04] bg-white/[0.02]">
                <h3 className={`text-[10px] font-semibold flex items-center gap-1 ${accent.text} uppercase tracking-wider`}>
                  <ArrowUpRight className="w-3 h-3" />
                  Rising {entityLabel.charAt(0).toUpperCase() + entityLabel.slice(1)}
                </h3>
              </div>
              <div className="divide-y divide-white/[0.03] max-h-80 overflow-y-auto">
                {trending.map((entity, i) => {
                  const rc = roleColors[entity.role] || { text: 'text-muted-foreground', bg: 'bg-white/10', border: 'border-white/[0.1]' }
                  const ts = TIER_STYLES[entity.tier]
                  const wrColor = entity.winrate >= 52 ? 'text-emerald-400' : entity.winrate >= 50 ? 'text-foreground' : 'text-rose-400'
                  const tierDotColor = entity.tier === 'S' ? 'bg-yellow-400' : entity.tier === 'A' ? 'bg-emerald-400' : entity.tier === 'B' ? 'bg-blue-400' : 'bg-violet-400'
                  return (
                    <div key={entity.name} className="group flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/[0.03] transition-all cursor-pointer">
                      <span className="text-[11px] font-bold text-muted-foreground/50 w-5 text-right shrink-0">{i + 1}</span>
                      <div className={`w-9 h-9 rounded-lg ${rc.bg} border ${rc.border} flex items-center justify-center text-sm font-bold ${rc.text} shrink-0 group-hover:scale-105 transition-transform`}>
                        {entityIcon || entity.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold truncate">{entity.name}</span>
                          <span className={`w-1.5 h-1.5 rounded-full ${tierDotColor}`} />
                          <span className={`text-[10px] font-bold ${ts.text}`}>{entity.tier}</span>
                        </div>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className={`text-xs font-semibold ${wrColor}`}>{entity.winrate}%</span>
                          <WinRateBar value={entity.winrate} />
                        </div>
                      </div>
                      <div className="text-right shrink-0 flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground hidden sm:inline">{entity.pickrate}% PR</span>
                        <span className="text-[11px] font-medium text-emerald-400 flex items-center gap-0.5">
                          <ChevronRight className="w-3 h-3" />+{entity.trendChange}%
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Meta sidebar */}
          <div className="space-y-3">
            {/* S-Tier entities */}
            <div className="rounded-lg border border-yellow-500/15 bg-yellow-500/[0.02] overflow-hidden">
              <div className="px-3 py-2 border-b border-yellow-500/10 bg-yellow-500/[0.03]">
                <h3 className="text-[10px] font-semibold flex items-center gap-1 text-yellow-400 uppercase tracking-wider">
                  <Crown className="w-3 h-3" />
                  S-Tier {entityLabel.charAt(0).toUpperCase() + entityLabel.slice(1)}
                </h3>
              </div>
              <div className="p-2 space-y-0.5 max-h-48 overflow-y-auto">
                {sTierEntities.map(e => {
                  const rc = roleColors[e.role] || { text: 'text-muted-foreground', bg: 'bg-white/10', border: 'border-white/[0.1]' }
                  return (
                    <div key={e.name} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-white/[0.04] transition-colors cursor-pointer">
                      <div className={`w-6 h-6 rounded-full ${rc.bg} border ${rc.border} flex items-center justify-center text-[9px] font-bold ${rc.text} shrink-0`}>
                        {entityIcon || e.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-semibold truncate">{e.name}</span>
                        <span className="text-[9px] text-muted-foreground ml-1">{e.role}</span>
                      </div>
                      <span className="text-[10px] font-bold text-yellow-400">{showPlacement ? `${e.placementRate}%` : `${e.winrate}%`}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Meta Insights */}
            {metaInsights && metaInsights.map((insight, idx) => (
              <div key={idx} className="rounded-lg border border-white/[0.06] bg-white/[0.01] overflow-hidden">
                <div className="px-3 py-2 border-b border-white/[0.04] bg-white/[0.02]">
                  <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{insight.title}</h3>
                </div>
                <div className="p-2 space-y-0.5">
                  {insight.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between px-2 py-1.5 rounded hover:bg-white/[0.03] transition-colors cursor-pointer">
                      <div className="min-w-0">
                        <div className="text-[10px] font-medium truncate">{item.label}</div>
                        {item.sublabel && <div className="text-[9px] text-muted-foreground">{item.sublabel}</div>}
                      </div>
                      <span className={`text-[10px] font-bold shrink-0 ml-2 ${accent.text}`}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Role averages */}
            <div className="rounded-lg border border-white/[0.06] bg-white/[0.01] overflow-hidden">
              <div className="px-3 py-2 border-b border-white/[0.04] bg-white/[0.02]">
                <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Role Averages</h3>
              </div>
              <div className="p-2 space-y-0.5 max-h-48 overflow-y-auto">
                {roleOnlyDefs.map(rd => {
                  const ents = entities.filter(e => e.role === rd.id)
                  if (ents.length === 0) return null
                  const avgWR = ents.reduce((a, b) => a + b.winrate, 0) / ents.length
                  const best = ents.reduce((a, b) => a.winrate > b.winrate ? a : b)
                  const rc = roleColors[rd.id]
                  if (!rc) return null
                  return (
                    <div key={rd.id} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-white/[0.03] transition-colors cursor-pointer">
                      <div className={`w-1.5 h-6 rounded-full ${rc.dot}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-[11px] font-medium">{rd.label}</span>
                          <span className={`text-[10px] font-bold ${avgWR >= 51 ? 'text-emerald-400' : 'text-foreground'}`}>{avgWR.toFixed(1)}%</span>
                        </div>
                        <WinRateBar value={avgWR} max={55} min={45} />
                        <span className="text-[9px] text-muted-foreground/50">Best: {best.name}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </FadeIn>

      {/* ── CTA ── */}
      <FadeIn delay={0.2} className="mt-8">
        <div className={`flex items-center justify-between gap-4 p-4 rounded-lg ${accent.bg} ${accent.border} border`}>
          <div>
            <h2 className="text-xs font-bold">Want to climb faster?</h2>
            <p className="text-[10px] text-muted-foreground mt-0.5">Get optimized builds, counters, live tracking & AI coaching for {game.name}.</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button size="sm" className={`${accent.button} ${accent.buttonHover} text-black font-bold h-7 text-[11px] px-3`}>
              Sign up free <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
            <Button variant="outline" size="sm" className="h-7 text-[11px] px-3">
              View Tier List
            </Button>
          </div>
        </div>
      </FadeIn>
    </>
  )
}

/* ────────────────────────────────────
   GAME HOME CONFIGS
   ──────────────────────────────────── */

const VALORANT_HOME_CONFIG: GameHomeConfig = {
  game: GAMES.find(g => g.id === 'valorant')!,
  entities: VALORANT_AGENTS,
  roles: VAL_ROLES_DEF,
  roleColors: VAL_ROLE_COLORS as unknown as Record<string, { text: string; bg: string; border: string; dot: string }>,
  patchLabel: 'Act III',
  searchPlaceholder: 'Search agents...',
  entityLabel: 'agents',
  entityIcon: '',
  secondaryStatLabel: 'KDA',
  showKda: true,
  showBanRate: true,
  metaInsights: [
    {
      title: 'Agent Stats',
      items: [
        { label: 'Highest KDA', value: '1.4', sublabel: 'Reyna' },
        { label: 'Most Banned', value: '3.1%', sublabel: 'Jett' },
        { label: 'Avg Win Rate', value: '50.1%', sublabel: 'All agents' },
        { label: 'Duelist Dominance', value: '62.6%', sublabel: 'Combined pick rate' },
      ],
    },
    {
      title: 'Map Win Rates',
      items: [
        { label: 'Ascent', value: '51.2%', sublabel: 'Attackers favored' },
        { label: 'Haven', value: '49.8%', sublabel: 'Balanced' },
        { label: 'Bind', value: '50.5%', sublabel: 'Slight atk edge' },
      ],
    },
  ],
}

const TFT_HOME_CONFIG: GameHomeConfig = {
  game: GAMES.find(g => g.id === 'tft')!,
  entities: TFT_COMPS,
  roles: TFT_COST_ROLES_DEF,
  roleColors: TFT_COST_COLORS,
  patchLabel: 'Set 12',
  searchPlaceholder: 'Search comps...',
  entityLabel: 'comps',
  entityIcon: '',
  showPlacement: true,
  metaInsights: [
    {
      title: 'Set 12 Overview',
      items: [
        { label: 'S-Tier Comps', value: '4', sublabel: 'Strongest builds' },
        { label: 'Avg Top 4', value: '23.2%', sublabel: 'All comps' },
        { label: 'Easiest S-Tier', value: '31.2%', sublabel: 'Cybernetic Bash' },
        { label: 'Hardest Comp', value: '18.5%', sublabel: 'Chem-Baron' },
      ],
    },
    {
      title: 'Augment Tier',
      items: [
        { label: 'Top Silver', value: 'Prism', sublabel: '+12% top4' },
        { label: 'Top Gold', value: 'Economizer', sublabel: '+9% top4' },
        { label: 'Top Prismatic', value: 'Force of Nature', sublabel: '+15% top4' },
      ],
    },
  ],
}

const DEADLOCK_HOME_CONFIG: GameHomeConfig = {
  game: GAMES.find(g => g.id === 'deadlock')!,
  entities: DEADLOCK_HEROES,
  roles: DL_ROLES_DEF,
  roleColors: DL_ROLE_COLORS as unknown as Record<string, { text: string; bg: string; border: string; dot: string }>,
  patchLabel: 'Patch 1.0',
  searchPlaceholder: 'Search heroes...',
  entityLabel: 'heroes',
  entityIcon: '',
  secondaryStatLabel: 'KDA',
  showKda: true,
  metaInsights: [
    {
      title: 'Hero Stats',
      items: [
        { label: 'Highest KDA', value: '5.1', sublabel: 'Viscous' },
        { label: 'Avg Win Rate', value: '50.3%', sublabel: 'All heroes' },
        { label: 'Most Picked', value: '22.5%', sublabel: 'Seven' },
        { label: 'Rising Fast', value: '+1.1%', sublabel: 'Vindicta' },
      ],
    },
    {
      title: 'Lane Meta',
      items: [
        { label: 'Lane 1', value: 'Seven', sublabel: '53.1% WR' },
        { label: 'Lane 2', value: 'Grey Talon', sublabel: '51.2% WR' },
        { label: 'Lane 3', value: 'Abrams', sublabel: '52.8% WR' },
        { label: 'Lane 4', value: 'Viscous', sublabel: '52.2% WR' },
      ],
    },
  ],
}

const LOL_HOME_CONFIG: GameHomeConfig = {
  game: GAMES.find(g => g.id === 'lol')!,
  entities: LOL_CHAMPIONS.map(c => ({ name: c.name, role: c.role, winrate: c.winrate, pickrate: c.pickrate, banrate: c.banrate, tier: c.tier, trend: c.trend, trendChange: c.trendChange, games: c.games })),
  roles: LOL_ROLES.map(r => ({ id: r.id, label: r.label, color: r.color, bgColor: r.bgColor, dotColor: r.id === 'All' ? '' : (ROLE_COLORS[r.id as LoLRole]?.dot || '') })) as unknown as GameRoleDef[],
  roleColors: ROLE_COLORS as unknown as Record<string, { text: string; bg: string; border: string; dot: string }>,
  patchLabel: 'Patch 14.10',
  searchPlaceholder: 'Search champions...',
  entityLabel: 'champions',
  entityIcon: '',
  secondaryStatLabel: 'Games',
  showKda: false,
  showBanRate: true,
  metaInsights: [
    {
      title: 'Champion Stats',
      items: [
        { label: 'Highest Win Rate', value: '52.1%', sublabel: 'Jinx' },
        { label: 'Most Banned', value: '12.1%', sublabel: 'Yuumi' },
        { label: 'Avg Win Rate', value: '50.3%', sublabel: 'All champions' },
        { label: 'Most Played', value: '280K', sublabel: 'Jinx games' },
      ],
    },
    {
      title: 'Patch Highlights',
      items: [
        { label: 'Buffed', value: 'Aatrox', sublabel: '+0.5% WR' },
        { label: 'Nerfed', value: 'Yasuo', sublabel: '-0.6% WR' },
        { label: 'Rising', value: 'Aphelios', sublabel: '+0.9% WR' },
      ],
    },
  ],
}

const DOTA2_HOME_CONFIG: GameHomeConfig = {
  game: GAMES.find(g => g.id === 'dota2')!,
  entities: DOTA2_HEROES,
  roles: DOTA_ROLES_DEF,
  roleColors: DOTA_ROLE_COLORS as unknown as Record<string, { text: string; bg: string; border: string; dot: string }>,
  patchLabel: 'Patch 7.37',
  searchPlaceholder: 'Search heroes...',
  entityLabel: 'heroes',
  entityIcon: '',
  showBanRate: true,
  metaInsights: [
    {
      title: 'Draft Stats',
      items: [
        { label: 'Most Banned', value: '12.5%', sublabel: 'Pudge' },
        { label: 'Highest Win Rate', value: '53.2%', sublabel: 'Pudge' },
        { label: 'Most Picked', value: '25.1%', sublabel: 'Pudge' },
        { label: 'Rising Fast', value: '+0.6%', sublabel: 'Pudge' },
      ],
    },
    {
      title: 'Patch Highlights',
      items: [
        { label: 'Nerfed', value: 'Spirit Breaker', sublabel: '-0.3% WR' },
        { label: 'Buffed', value: 'Hoodwink', sublabel: '+0.4% WR' },
        { label: 'New Item Meta', value: 'Arcane Blink', sublabel: 'High impact' },
      ],
    },
  ],
}

/* ────────────────────────────────────
   GAME CONFIG BUILDER (from live API data)
   ──────────────────────────────────── */

function buildHomeConfig(gameId: GameId, stats: GameStatsResponse, fallbackConfig?: GameHomeConfig): GameHomeConfig {
  const game = GAMES.find(g => g.id === gameId)!
  const entities = stats.entities || []

  // Determine roles/roleColors based on game
  const gameRoles = getRolesForGame(gameId)
  const gameRoleColors = getRoleColorsForGame(gameId)

  return {
    game,
    entities,
    roles: gameRoles,
    roleColors: gameRoleColors,
    patchLabel: stats.patchLabel || (fallbackConfig?.patchLabel || ''),
    searchPlaceholder: getSearchPlaceholder(gameId),
    entityLabel: getEntityLabel(gameId),
    entityIcon: '',
    secondaryStatLabel: getSecondaryStat(gameId),
    showKda: ['valorant', 'deadlock', 'dota2'].includes(gameId),
    showPlacement: gameId === 'tft',
    showBanRate: ['valorant', 'lol', 'dota2'].includes(gameId),
    metaInsights: stats.metaInsights || fallbackConfig?.metaInsights || [],
  }
}

function getRolesForGame(gameId: GameId): GameRoleDef[] {
  switch (gameId) {
    case 'valorant': return VAL_ROLES_DEF as unknown as GameRoleDef[]
    case 'tft': return TFT_COST_ROLES_DEF as unknown as GameRoleDef[]
    case 'deadlock': return DL_ROLES_DEF as unknown as GameRoleDef[]
    case 'dota2': return DOTA_ROLES_DEF as unknown as GameRoleDef[]
    case 'lol': return LOL_ROLES.map(r => ({ id: r.id, label: r.label, color: r.color, bgColor: r.bgColor, dotColor: r.id === 'All' ? '' : (ROLE_COLORS[r.id as LoLRole]?.dot || '') })) as unknown as GameRoleDef[]
    case 'helldivers2': return [
      { id: 'All', label: 'All', color: 'text-foreground', bgColor: 'bg-white/10', dotColor: '' },
      { id: 'Primary', label: 'Primary', color: 'text-orange-400', bgColor: 'bg-orange-500/10', dotColor: 'bg-orange-400' },
      { id: 'Secondary', label: 'Secondary', color: 'text-cyan-400', bgColor: 'bg-cyan-500/10', dotColor: 'bg-cyan-400' },
      { id: 'Support', label: 'Support', color: 'text-amber-400', bgColor: 'bg-amber-500/10', dotColor: 'bg-amber-400' },
    ] as unknown as GameRoleDef[]
    case 'wow': return [
      { id: 'All', label: 'All', color: 'text-foreground', bgColor: 'bg-white/10', dotColor: '' },
      { id: 'Tank', label: 'Tank', color: 'text-amber-400', bgColor: 'bg-amber-500/10', dotColor: 'bg-amber-400' },
      { id: 'Healer', label: 'Healer', color: 'text-green-400', bgColor: 'bg-green-500/10', dotColor: 'bg-green-400' },
      { id: 'DPS', label: 'DPS', color: 'text-red-400', bgColor: 'bg-red-500/10', dotColor: 'bg-red-400' },
    ] as unknown as GameRoleDef[]
    case 'rematch': return [
      { id: 'All', label: 'All', color: 'text-foreground', bgColor: 'bg-white/10', dotColor: '' },
      { id: 'Striker', label: 'Striker', color: 'text-red-400', bgColor: 'bg-red-500/10', dotColor: 'bg-red-400' },
      { id: 'Tank', label: 'Tank', color: 'text-amber-400', bgColor: 'bg-amber-500/10', dotColor: 'bg-amber-400' },
      { id: 'Ranged', label: 'Ranged', color: 'text-cyan-400', bgColor: 'bg-cyan-500/10', dotColor: 'bg-cyan-400' },
      { id: 'Support', label: 'Support', color: 'text-green-400', bgColor: 'bg-green-500/10', dotColor: 'bg-green-400' },
    ] as unknown as GameRoleDef[]
    case '2xko': return [
      { id: 'All', label: 'All', color: 'text-foreground', bgColor: 'bg-white/10', dotColor: '' },
      { id: 'Power', label: 'Power', color: 'text-red-400', bgColor: 'bg-red-500/10', dotColor: 'bg-red-400' },
      { id: 'Speed', label: 'Speed', color: 'text-cyan-400', bgColor: 'bg-cyan-500/10', dotColor: 'bg-cyan-400' },
      { id: 'Technical', label: 'Technical', color: 'text-violet-400', bgColor: 'bg-violet-500/10', dotColor: 'bg-violet-400' },
    ] as unknown as GameRoleDef[]
    default: return [
      { id: 'All', label: 'All', color: 'text-foreground', bgColor: 'bg-white/10', dotColor: '' },
      { id: 'Default', label: 'Default', color: 'text-muted-foreground', bgColor: 'bg-white/5', dotColor: 'bg-muted-foreground' },
    ] as unknown as GameRoleDef[]
  }
}

function getRoleColorsForGame(gameId: GameId): Record<string, { text: string; bg: string; border: string; dot: string }> {
  switch (gameId) {
    case 'valorant': return VAL_ROLE_COLORS as unknown as Record<string, { text: string; bg: string; border: string; dot: string }>
    case 'tft': return TFT_COST_COLORS
    case 'deadlock': return DL_ROLE_COLORS as unknown as Record<string, { text: string; bg: string; border: string; dot: string }>
    case 'dota2': return DOTA_ROLE_COLORS as unknown as Record<string, { text: string; bg: string; border: string; dot: string }>
    case 'lol': return ROLE_COLORS as unknown as Record<string, { text: string; bg: string; border: string; dot: string }>
    default: return {}
  }
}

function getSearchPlaceholder(gameId: GameId): string {
  const map: Record<string, string> = {
    lol: 'Search champions...', valorant: 'Search agents...', tft: 'Search comps...',
    deadlock: 'Search heroes...', dota2: 'Search heroes...', helldivers2: 'Search weapons...',
    wow: 'Search specs...', rematch: 'Search fighters...', '2xko': 'Search fighters...',
  }
  return map[gameId] || 'Search...'
}

function getEntityLabel(gameId: GameId): string {
  const map: Record<string, string> = {
    lol: 'champions', valorant: 'agents', tft: 'comps', deadlock: 'heroes',
    dota2: 'heroes', helldivers2: 'weapons', wow: 'specs', rematch: 'fighters', '2xko': 'fighters',
  }
  return map[gameId] || 'entities'
}

function getSecondaryStat(gameId: GameId): string {
  const map: Record<string, string> = {
    valorant: 'KDA', deadlock: 'KDA', dota2: 'KDA', lol: 'KDA', tft: 'Top 4',
  }
  return map[gameId] || ''
}

/* ────────────────────────────────────
   GAME DETAIL PAGE
   ──────────────────────────────────── */

function GamePage({ game, activeSection = 'home', onBack, onSectionChange }: { game: Game; activeSection: string; onBack: () => void; onSectionChange?: (id: string) => void }) {
  const Icon = game.icon
  const isComingSoon = game.isComingSoon || false

  // Fetch live stats for this game
  const { data: liveStats, isLoading: statsLoading, refetch } = useGameStats({
    gameId: game.id,
    enabled: activeSection === 'home',
    refetchInterval: 5 * 60 * 1000,
  })

  // Fallback static configs
  const homeConfigMap: Record<string, GameHomeConfig> = {
    lol: LOL_HOME_CONFIG,
    valorant: VALORANT_HOME_CONFIG,
    tft: TFT_HOME_CONFIG,
    deadlock: DEADLOCK_HOME_CONFIG,
    dota2: DOTA2_HOME_CONFIG,
  }

  // Build config from live data, with fallback to static
  const dynamicConfig = useMemo(() => {
    if (liveStats?.entities?.length) {
      return buildHomeConfig(game.id, liveStats, homeConfigMap[game.id])
    }
    return homeConfigMap[game.id] || null
  }, [game.id, liveStats, homeConfigMap, isComingSoon])

  // LoL-specific section routing
  if (game.id === 'lol' && !isComingSoon) {
    return (
      <motion.div key={game.id} variants={pageVariants} initial="initial" animate="animate" exit="exit">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-16">
          {activeSection === 'home' && (
            statsLoading && !liveStats ? <DashboardLoadingSkeleton /> : (
              dynamicConfig ? <GameDashboardHome config={dynamicConfig} lastUpdated={liveStats?.lastUpdated} source={liveStats?.source} isLoading={statsLoading} onRefresh={() => refetch()} /> : null
            )
          )}
          {activeSection !== 'home' && <>
            {activeSection === 'champions' && <LoLChampionsSection />}
            {activeSection === 'builds' && <LoLBuildsSection />}
            {activeSection === 'runes' && <LoLRunesSection />}
            {activeSection === 'counters' && <LoLCountersSection />}
            {activeSection === 'pro-builds' && <LoLProBuildsSection />}
            {activeSection === 'tier-list' && <LoLTierListSection />}
            {activeSection === 'leaderboards' && <LoLLeaderboardsSection />}
            {activeSection === 'live-game' && <LoLLiveGameSection />}
          </>}
        </main>
        <Footer />
      </motion.div>
    )
  }

  // Active games with rich dashboard home (valorant, tft, deadlock, dota2)
  if (dynamicConfig && !isComingSoon) {
    return (
      <motion.div key={game.id} variants={pageVariants} initial="initial" animate="animate" exit="exit">
        {activeSection === 'home' ? (
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-16">
            {statsLoading && !liveStats ? (
              <DashboardLoadingSkeleton />
            ) : (
              <GameDashboardHome config={dynamicConfig} lastUpdated={liveStats?.lastUpdated} source={liveStats?.source} isLoading={statsLoading} onRefresh={() => refetch()} />
            )}
          </main>
        ) : (
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-24">
            <FadeIn>
              <Card className="max-w-md mx-auto border-dashed border-white/10 py-0">
                <CardContent className="p-8 text-center">
                  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mx-auto mb-4">
                    <Compass className="w-6 h-6 text-muted-foreground/50" />
                  </div>
                  <h2 className="text-lg font-bold mb-2">Section in development</h2>
                  <p className="text-sm text-muted-foreground mb-4">This section will be available soon for {game.name}.</p>
                  <Button variant="outline" size="sm" onClick={() => onSectionChange?.('home')}><HomeIcon className="w-3.5 h-3.5 mr-1.5" />{game.shortName} Home</Button>
                </CardContent>
              </Card>
            </FadeIn>
          </main>
        )}
        <Footer />
      </motion.div>
    )
  }

  // Coming Soon pages - also use live data when available
  if (isComingSoon) {
    // If we have live stats, show a rich dashboard instead of static coming soon
    if (dynamicConfig && liveStats?.entities?.length) {
      return (
        <motion.div key={game.id} variants={pageVariants} initial="initial" animate="animate" exit="exit">
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-16">
            {statsLoading && !liveStats ? (
              <DashboardLoadingSkeleton />
            ) : (
              <GameDashboardHome config={dynamicConfig} lastUpdated={liveStats?.lastUpdated} source={liveStats?.source} isLoading={statsLoading} onRefresh={() => refetch()} />
            )}
          </main>
          <Footer />
        </motion.div>
      )
    }
    return (
      <motion.div key={game.id} variants={pageVariants} initial="initial" animate="animate" exit="exit">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-16">
          {statsLoading ? <DashboardLoadingSkeleton /> : <ComingSoonSection game={game} onBack={onBack} />}
        </main>
        <Footer />
      </motion.div>
    )
  }

  // Generic fallback (should not be reached if homeConfigMap is complete)
  return (
    <motion.div key={game.id} variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <main>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 h-72 sm:h-80">
            <div className={`absolute inset-0 bg-gradient-to-br ${game.gradientBg}`} />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/40" />
            <div className="absolute inset-0 bg-gradient-to-r from-background/80 to-transparent" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-10">
              <Icon className="w-64 h-64" />
            </div>
          </div>
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/10 shrink-0">
                  <Icon className={`w-6 h-6 sm:w-7 sm:h-7 ${game.iconColor}`} />
                </div>
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">{game.name}</h1>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">{game.tagline}</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
          <FadeIn>
            <Card className="max-w-md mx-auto border-dashed border-white/10 py-0">
              <CardContent className="p-8 text-center">
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mx-auto mb-4">
                  <Compass className="w-6 h-6 text-muted-foreground/50" />
                </div>
                <h2 className="text-lg font-bold mb-2">Content coming soon</h2>
                <p className="text-sm text-muted-foreground mb-4">More tools for {game.name} are in development.</p>
                <Button variant="outline" size="sm" onClick={onBack}><HomeIcon className="w-3.5 h-3.5 mr-1.5" />All Games</Button>
              </CardContent>
            </Card>
          </FadeIn>
        </section>
      </main>
      <Footer />
    </motion.div>
  )
}

/* ────────────────────────────────────
   GLOBAL COMMAND PALETTE (Cmd+K)
   ──────────────────────────────────── */

interface SearchResult {
  id: string
  type: 'game' | 'champion' | 'agent' | 'hero' | 'comp'
  name: string
  sub: string
  gameId: GameId
  tier?: string
  winrate?: number
}

function CommandPalette({ open, onClose, onSelectGame }: { open: boolean; onClose: () => void; onSelectGame: (id: GameId) => void }) {
  // Reset query and focus input when palette opens/closes
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleClose = useCallback(() => {
    setQuery('')
    onClose()
  }, [onClose])

  // Focus input when palette opens
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => inputRef.current?.focus(), 100)
      return () => clearTimeout(timer)
    }
  }, [open])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        if (open) onClose()
      }
      if (e.key === 'Escape' && open) onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  const allResults: SearchResult[] = useMemo(() => {
    const results: SearchResult[] = []
    // Games
    GAMES.forEach(g => {
      results.push({ id: `game-${g.id}`, type: 'game', name: g.name, sub: g.tagline, gameId: g.id })
    })
    // LoL champions
    LOL_CHAMPIONS.forEach(c => {
      results.push({ id: `lol-${c.name}`, type: 'champion', name: c.name, sub: `LoL ${c.role} — ${c.winrate}% WR`, gameId: 'lol', tier: c.tier, winrate: c.winrate })
    })
    // Valorant agents
    VALORANT_AGENTS.forEach(a => {
      results.push({ id: `val-${a.name}`, type: 'agent', name: a.name, sub: `Valorant ${a.role} — ${a.winrate}% WR`, gameId: 'valorant', tier: a.tier, winrate: a.winrate })
    })
    // TFT comps
    TFT_COMPS.forEach(c => {
      results.push({ id: `tft-${c.name}`, type: 'comp', name: c.name, sub: `TFT ${c.difficulty} — ${c.placementRate}% T4`, gameId: 'tft', tier: c.tier, winrate: c.placementRate })
    })
    // Deadlock heroes
    DEADLOCK_HEROES.forEach(h => {
      results.push({ id: `dl-${h.name}`, type: 'hero', name: h.name, sub: `Deadlock ${h.role} — ${h.winrate}% WR`, gameId: 'deadlock', tier: h.tier, winrate: h.winrate })
    })
    // Dota2 heroes
    DOTA2_HEROES.forEach(h => {
      results.push({ id: `dota-${h.name}`, type: 'hero', name: h.name, sub: `Dota 2 ${h.role} — ${h.winrate}% WR`, gameId: 'dota2', tier: h.tier, winrate: h.winrate })
    })
    return results
  }, [])

  const filtered = useMemo(() => {
    if (!query.trim()) {
      // Show games + top 8 trending entities
      const trending = allResults.filter(r => r.type !== 'game').sort((a, b) => (b.winrate || 0) - (a.winrate || 0)).slice(0, 8)
      return [...allResults.filter(r => r.type === 'game'), ...trending]
    }
    const q = query.toLowerCase()
    return allResults.filter(r => r.name.toLowerCase().includes(q) || r.sub.toLowerCase().includes(q)).slice(0, 12)
  }, [query, allResults])

  const tierColorMap: Record<string, string> = { S: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20', A: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', B: 'text-blue-400 bg-blue-500/10 border-blue-500/20', C: 'text-violet-400 bg-violet-500/10 border-violet-500/20' }

  const typeIconMap: Record<string, typeof Swords> = { game: Gamepad2, champion: Swords, agent: Crosshair, hero: Zap, comp: Crown }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={handleClose} />
          <motion.div className="fixed inset-x-0 top-[15vh] z-[101] mx-auto max-w-xl px-4" initial={{ opacity: 0, y: -20, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.96 }} transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}>
            <div className="rounded-xl border border-white/[0.08] bg-[#111113]/95 backdrop-blur-xl shadow-2xl shadow-black/60 overflow-hidden">
              {/* Search input */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.06]">
                <Search className="w-4 h-4 text-muted-foreground shrink-0" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search games, champions, agents, heroes..."
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 outline-none"
                />
                <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded border border-white/[0.08] bg-white/[0.04] text-[10px] text-muted-foreground">
                  ESC
                </kbd>
              </div>
              {/* Results */}
              <div className="max-h-[50vh] overflow-y-auto py-2">
                {!query.trim() && (
                  <div className="px-4 py-1.5">
                    <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/60">Quick Access</span>
                  </div>
                )}
                {filtered.map((result) => {
                  const TypeIcon = typeIconMap[result.type] || Swords
                  const game = GAMES.find(g => g.id === result.gameId)
                  const accent = ACCENT_MAP[game?.accentColor || 'emerald'] || ACCENT_MAP.emerald
                  return (
                    <button
                      key={result.id}
                      onClick={() => { onSelectGame(result.gameId); onClose() }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.04] transition-colors cursor-pointer text-left group"
                    >
                      <div className={`w-8 h-8 rounded-lg ${accent.bg} border ${accent.border} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}>
                        <TypeIcon className={`w-3.5 h-3.5 ${accent.text}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold truncate">{result.name}</span>
                          {result.tier && <span className={`text-[8px] px-1 py-px rounded font-bold border ${tierColorMap[result.tier]}`}>{result.tier}</span>}
                        </div>
                        <span className="text-[10px] text-muted-foreground truncate">{result.sub}</span>
                      </div>
                      {result.type === 'game' && (
                        <span className="text-[9px] text-muted-foreground/50">{result.isComingSoon ? 'Coming Soon' : 'Open'}</span>
                      )}
                    </button>
                  )
                })}
                {filtered.length === 0 && (
                  <div className="px-4 py-8 text-center">
                    <p className="text-sm text-muted-foreground">No results found for "{query}"</p>
                  </div>
                )}
              </div>
              {/* Footer hint */}
              <div className="flex items-center gap-4 px-4 py-2 border-t border-white/[0.04] bg-white/[0.01]">
                <span className="text-[9px] text-muted-foreground/50 flex items-center gap-1"><Keyboard className="w-2.5 h-2.5" />↑↓ Navigate</span>
                <span className="text-[9px] text-muted-foreground/50 flex items-center gap-1"><span className="px-1 py-px rounded border border-white/[0.06] bg-white/[0.03] text-[8px]">↵</span> Select</span>
                <span className="text-[9px] text-muted-foreground/50 flex items-center gap-1"><span className="px-1 py-px rounded border border-white/[0.06] bg-white/[0.03] text-[8px]">esc</span> Close</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

/* ────────────────────────────────────
   FOOTER (shared)
   ──────────────────────────────────── */

function Footer() {
  const footerLinks = {
    Producto: ['League of Legends', 'TFT', 'Valorant', 'Deadlock', 'Dota 2', 'Rematch', 'WoW', 'Helldivers 2', '2XKO', 'Precios'],
    Recursos: ['Tier Lists', 'Builds', 'Counters', 'Leaderboards', 'Blog', 'API'],
    Empresa: ['Sobre nosotros', 'Carreras', 'Prensa', 'Contacto'],
    Legal: ['Términos de servicio', 'Privacidad', 'Cookies', 'EULA'],
  }

  return (
    <footer className="border-t border-border/60 bg-[#06060a] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center">
                <Trophy className="w-3.5 h-3.5 text-black" />
              </div>
              <span className="font-bold text-sm">
                Tracker<span className="text-emerald-400">Stat</span>
                <span className="text-muted-foreground/60">.gg</span>
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed mb-3">Analítica competitiva de nivel profesional para jugadores serios.</p>
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/50">
              <Keyboard className="w-3 h-3" />
              <span>Press <kbd className="px-1 py-px rounded border border-border bg-secondary text-[9px] font-mono">⌘K</kbd> to search</span>
            </div>
          </div>
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">{category}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link}><a href="#" className="text-xs text-muted-foreground/80 hover:text-foreground transition-colors">{link}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-border/40 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground/60">© 2025 TrackerStat.gg. Todos los derechos reservados. No respaldado por Riot Games ni ningún otro editor.</p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-muted-foreground/60 hover:text-foreground transition-colors"><Globe className="w-4 h-4" /></a>
            <a href="#" className="text-muted-foreground/60 hover:text-foreground transition-colors">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/></svg>
            </a>
            <a href="#" className="text-muted-foreground/60 hover:text-foreground transition-colors">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

/* ────────────────────────────────────
   MAIN EXPORT
   ──────────────────────────────────── */

export default function Home() {
  const [selectedGameId, setSelectedGameId] = useState<GameId | null>('lol')
  const [sidebarExpanded, setSidebarExpanded] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('home')
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const isDesktop = useIsDesktop()

  const selectedGame = GAMES.find(g => g.id === selectedGameId) ?? null

  const goHome = useCallback(() => {
    setSelectedGameId(null)
    setActiveSection('home')
    setSidebarExpanded(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const goToGame = useCallback((id: GameId) => {
    setSelectedGameId(id)
    setActiveSection('home')
    setSidebarExpanded(false)
    setMobileSidebarOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const toggleSidebar = useCallback(() => {
    setSidebarExpanded(prev => !prev)
  }, [])

  const toggleMobileSidebar = useCallback(() => {
    setMobileSidebarOpen(prev => !prev)
  }, [])

  // Global Cmd+K listener
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCommandPaletteOpen(prev => !prev)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  // Compute sidebar padding for main content
  const sidebarPadding = selectedGame && isDesktop ? (sidebarExpanded ? 200 : 56) : 0

  return (
    <div className="min-h-screen flex flex-col">
      {/* Scroll progress indicator */}
      <ScrollProgress />
      <Navbar
        selectedGameId={selectedGameId}
        onLogoClick={goHome}
        onSelectGame={goToGame}
        onToggleMobileSidebar={toggleMobileSidebar}
        onOpenCommandPalette={() => setCommandPaletteOpen(true)}
      />

      {/* Desktop Sidebar */}
      {selectedGame && (
        <GameSidebar
          game={selectedGame}
          expanded={sidebarExpanded}
          onToggle={toggleSidebar}
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />
      )}

      {/* Mobile Sidebar */}
      {selectedGame && (
        <MobileSidebar
          game={selectedGame}
          open={mobileSidebarOpen && !isDesktop}
          onClose={() => setMobileSidebarOpen(false)}
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />
      )}

      {/* Main Content */}
      <motion.main
        className="flex-1 flex flex-col pt-14"
        animate={{ paddingLeft: sidebarPadding }}
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      >
        <AnimatePresence mode="wait">
          {selectedGame ? (
            <GamePage key={selectedGame.id} game={selectedGame} activeSection={activeSection} onBack={goHome} onSectionChange={setActiveSection} />
          ) : (
            <HomePage key="home" onSelectGame={goToGame} />
          )}
        </AnimatePresence>
      </motion.main>

      {/* Global Command Palette */}
      <CommandPalette
        open={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onSelectGame={goToGame}
      />

      {/* Toast Notifications */}
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: { background: '#18181b', border: '1px solid rgba(255,255,255,0.08)', color: '#e4e4e7', fontSize: '13px' },
        }}
      />
    </div>
  )
}

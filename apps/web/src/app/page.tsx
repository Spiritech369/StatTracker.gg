'use client'

import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowRight,
  BarChart3,
  Brain,
  Check,
  Compass,
  Crosshair,
  Crown,
  Eye,
  Gamepad2,
  Globe,
  Home as HomeIcon,
  Keyboard,
  Search,
  Shield,
  Sparkles,
  Swords,
  Target,
  Trophy,
  Users,
  Wrench,
  Zap,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Toaster } from 'sonner'
import { FadeIn, pageVariants, useIsDesktop } from '@/components/animations'
import { DashboardLoadingSkeleton } from '@/components/dashboard-primitives'
import { GameDashboardHome } from '@/components/game-dashboard-home'
import { Footer, GameSidebar, MobileSidebar, Navbar } from '@/components/layout'
import { HomePage } from '@/components/marketing-home'
import { ScrollProgress } from '@/components/ScrollProgress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { DEADLOCK_HEROES, DL_ROLE_COLORS, DL_ROLES_DEF } from '@/features/deadlock/data'
import { DOTA_ROLE_COLORS, DOTA_ROLES_DEF, DOTA2_HEROES } from '@/features/dota2/data'
import { ACCENT_MAP, type GameHomeConfig, type GameRoleDef } from '@/features/games/dashboard-types'
import { GAMES } from '@/features/games/data'
import type { Game, GameId } from '@/features/games/types'
import { LOL_ROLES, type LoLRole, ROLE_COLORS } from '@/features/lol/constants'
import { LOL_CHAMPIONS } from '@/features/lol/data'
import {
  LoLBuildsSection,
  LoLChampionsSection,
  LoLCountersSection,
  LoLLeaderboardsSection,
  LoLLiveGameSection,
  LoLProBuildsSection,
  LoLRunesSection,
  LoLTierListSection,
} from '@/features/lol/sections'
import { TFT_COMPS, TFT_COST_COLORS, TFT_COST_ROLES_DEF } from '@/features/tft/data'
import { VAL_ROLE_COLORS, VAL_ROLES_DEF, VALORANT_AGENTS } from '@/features/valorant/data'
import { type GameStatsResponse, useGameStats } from '@/hooks/useGameStats'

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
    description:
      'The spiritual successor to classic RPG combat arenas. Rematch brings deep class customization, strategic PvP, and PvE dungeons back to the competitive scene.',
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
      {
        icon: Swords,
        title: 'Class Tier Lists',
        description: 'Tier rankings for all classes and specs across PvP and PvE content',
      },
      {
        icon: Wrench,
        title: 'Build Optimizer',
        description: 'Stat-optimized builds with community-validated gear and skill setups',
      },
      {
        icon: Target,
        title: 'Matchup Analyzer',
        description: 'Win rates and strategies for every class vs class matchup',
      },
      {
        icon: Sparkles,
        title: 'Perk Calculator',
        description: 'Interactive perk tree planner with synergy suggestions',
      },
      {
        icon: Trophy,
        title: 'Leaderboards',
        description: 'Global and regional rankings for competitive PvP seasons',
      },
      {
        icon: Brain,
        title: 'AI Draft Coach',
        description: 'Smart team composition suggestions for PvP and dungeon runs',
      },
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
    description:
      'The definitive MMO analytics platform. From Mythic+ dungeon routing to raid encounter optimization and PvP tier tracking — everything a serious WoW player needs.',
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
      {
        icon: Swords,
        title: 'Talent Build Explorer',
        description: 'All talent builds for every spec, ranked by performance in Mythic+ and raids',
      },
      {
        icon: Target,
        title: 'Mythic+ Routing',
        description: 'Optimized routes for every dungeon with class composition suggestions',
      },
      {
        icon: Shield,
        title: 'Raid Encounter Guides',
        description: 'Boss-by-boss strategies with spec-specific tips and gear checks',
      },
      {
        icon: Users,
        title: 'PvP Tier List',
        description: 'Arena and BG tier rankings by spec with comp analysis',
      },
      {
        icon: BarChart3,
        title: 'WCL Integration',
        description: 'Warcraft Logs data for parse analysis and performance benchmarking',
      },
      {
        icon: Eye,
        title: 'Live Raid Tracking',
        description: 'Real-time raid progress tracking with wipe analysis',
      },
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
    description:
      'For Democracy! Comprehensive weapon stats, stratagem tier lists, enemy weakness databases, and mission optimizers for the ultimate Helldivers experience.',
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
      {
        icon: Swords,
        title: 'Weapon Tier List',
        description: 'Complete weapon rankings with DPS calculations and ammo efficiency',
      },
      {
        icon: Wrench,
        title: 'Loadout Builder',
        description: 'Create and share optimized loadouts for every mission difficulty',
      },
      {
        icon: Target,
        title: 'Enemy Database',
        description: 'Weakness charts, HP pools, and effective strategies for every enemy type',
      },
      {
        icon: Sparkles,
        title: 'Stratagem Guide',
        description: 'Detailed stratagem usage tips and cooldown optimization',
      },
      {
        icon: BarChart3,
        title: 'Mission Analytics',
        description: 'Success rates and optimal approaches for all operation types',
      },
      {
        icon: Users,
        title: 'Squad Finder',
        description: 'Find teammates for specific operations and difficulty levels',
      },
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
    description:
      "Riot Games' tag-team fighting game. Frame data, combo notation, tier lists, and matchup knowledge — everything a fighting game competitor needs.",
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
      {
        icon: Swords,
        title: 'Fighter Tier List',
        description: 'Ranked tier lists for every fighter across all skill brackets',
      },
      {
        icon: BarChart3,
        title: 'Frame Data Tool',
        description: 'Complete frame data for every move, startup, active, recovery',
      },
      {
        icon: Wrench,
        title: 'Combo Library',
        description: 'Community-submitted combos with notation and video references',
      },
      {
        icon: Target,
        title: 'Matchup Charts',
        description: 'Who wins each matchup and why, with specific strategy notes',
      },
      {
        icon: Brain,
        title: 'AI Lab Partner',
        description: 'Practice specific scenarios and punish windows with AI assistance',
      },
      {
        icon: Trophy,
        title: 'Tournament Tracker',
        description: 'Track competitive results, top players, and meta evolution',
      },
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
  const info = COMING_SOON_INFO.find((i) => i.gameId === game.id)
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
                <div
                  className={`w-10 h-10 rounded-xl ${accent.bg} border ${accent.border} flex items-center justify-center`}
                >
                  <Icon className={`w-5 h-5 ${accent.text}`} />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-lg font-bold tracking-tight">{game.name}</h1>
                    <Badge
                      className={`${statusColorMap[info.status]} text-[9px] font-semibold px-1.5 py-0 border`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${statusDotMap[info.status]} mr-1 animate-pulse`}
                      />
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
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 h-7 text-[11px]"
                  onClick={onBack}
                >
                  <HomeIcon className="w-3 h-3" />
                  All Games
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
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              Development Progress
            </span>
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
            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Gamepad2 className="w-3 h-3" />
              {info.genre}
            </span>
            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Globe className="w-3 h-3" />
              {info.platform}
            </span>
            <span className="text-[10px] text-muted-foreground hidden sm:flex items-center gap-1">
              <Users className="w-3 h-3" />
              {info.developer}
            </span>
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
            <div
              key={feat.title}
              className={`flex items-center gap-2 p-2.5 rounded-lg ${accent.bg} hover:bg-white/[0.04] transition-all`}
            >
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
                  Preview — {info.previewEntities.length}{' '}
                  {info.gameId === 'helldivers2'
                    ? 'Weapons'
                    : info.gameId === '2xko'
                      ? 'Fighters'
                      : info.gameId === 'wow'
                        ? 'Classes'
                        : 'Classes'}
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
                    <div
                      className={`w-7 h-7 rounded-lg ${accent.bg} border ${accent.border} flex items-center justify-center text-[10px] font-bold ${accent.text} shrink-0 group-hover:scale-105 transition-transform`}
                    >
                      {entity.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] font-semibold truncate leading-tight">
                        {entity.name}
                      </div>
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
                      <div
                        className={`w-8 h-8 rounded-lg ${accent.bg} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}
                      >
                        <FeatureIcon className={`w-4 h-4 ${accent.text}`} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold leading-tight mb-0.5">
                          {feature.title}
                        </div>
                        <div className="text-[10px] text-muted-foreground leading-relaxed">
                          {feature.description}
                        </div>
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
                  <div
                    key={i}
                    className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/[0.04] transition-colors"
                  >
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
                <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Get Notified
                </h3>
              </div>
              <div className="p-3 space-y-2">
                <p className="text-[10px] text-muted-foreground">
                  Be the first to know when {game.shortName} tools launch.
                </p>
                <div className="flex gap-1.5">
                  <Input
                    placeholder="your@email.com"
                    className="h-7 text-[10px] bg-white/[0.03] border-white/[0.06] placeholder:text-muted-foreground/40"
                  />
                  <Button
                    size="sm"
                    className={`${accent.button} ${accent.buttonHover} text-black font-bold h-7 text-[10px] px-2.5 shrink-0`}
                  >
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
                <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Game Info
                </h3>
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
                  <span className={`text-[10px] font-bold ${accent.text}`}>
                    {info.estimatedLaunch}
                  </span>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>

      {/* ── CTA ── */}
      <FadeIn delay={0.2} className="mt-6">
        <div
          className={`flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-lg ${accent.bg} ${accent.border} border`}
        >
          <div className="text-center sm:text-left">
            <h2 className="text-xs font-bold">Want early access?</h2>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Sign up for the {game.shortName} beta and shape the tools with your feedback.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="sm"
              className={`${accent.button} ${accent.buttonHover} text-black font-bold h-7 text-[11px] px-3`}
            >
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
   GAME HOME CONFIGS
   ──────────────────────────────────── */

const VALORANT_HOME_CONFIG: GameHomeConfig = {
  game: GAMES.find((g) => g.id === 'valorant')!,
  entities: VALORANT_AGENTS,
  roles: VAL_ROLES_DEF,
  roleColors: VAL_ROLE_COLORS as unknown as Record<
    string,
    { text: string; bg: string; border: string; dot: string }
  >,
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
  game: GAMES.find((g) => g.id === 'tft')!,
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
  game: GAMES.find((g) => g.id === 'deadlock')!,
  entities: DEADLOCK_HEROES,
  roles: DL_ROLES_DEF,
  roleColors: DL_ROLE_COLORS as unknown as Record<
    string,
    { text: string; bg: string; border: string; dot: string }
  >,
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
  game: GAMES.find((g) => g.id === 'lol')!,
  entities: LOL_CHAMPIONS.map((c) => ({
    name: c.name,
    role: c.role,
    winrate: c.winrate,
    pickrate: c.pickrate,
    banrate: c.banrate,
    tier: c.tier,
    trend: c.trend,
    trendChange: c.trendChange,
    games: c.games,
  })),
  roles: LOL_ROLES.map((r) => ({
    id: r.id,
    label: r.label,
    color: r.color,
    bgColor: r.bgColor,
    dotColor: r.id === 'All' ? '' : ROLE_COLORS[r.id as LoLRole]?.dot || '',
  })) as unknown as GameRoleDef[],
  roleColors: ROLE_COLORS as unknown as Record<
    string,
    { text: string; bg: string; border: string; dot: string }
  >,
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
  game: GAMES.find((g) => g.id === 'dota2')!,
  entities: DOTA2_HEROES,
  roles: DOTA_ROLES_DEF,
  roleColors: DOTA_ROLE_COLORS as unknown as Record<
    string,
    { text: string; bg: string; border: string; dot: string }
  >,
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

function buildHomeConfig(
  gameId: GameId,
  stats: GameStatsResponse,
  fallbackConfig?: GameHomeConfig,
): GameHomeConfig {
  const game = GAMES.find((g) => g.id === gameId)!
  const entities = stats.entities || []

  // Determine roles/roleColors based on game
  const gameRoles = getRolesForGame(gameId)
  const gameRoleColors = getRoleColorsForGame(gameId)

  return {
    game,
    entities,
    roles: gameRoles,
    roleColors: gameRoleColors,
    patchLabel: stats.patchLabel || fallbackConfig?.patchLabel || '',
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
    case 'valorant':
      return VAL_ROLES_DEF as unknown as GameRoleDef[]
    case 'tft':
      return TFT_COST_ROLES_DEF as unknown as GameRoleDef[]
    case 'deadlock':
      return DL_ROLES_DEF as unknown as GameRoleDef[]
    case 'dota2':
      return DOTA_ROLES_DEF as unknown as GameRoleDef[]
    case 'lol':
      return LOL_ROLES.map((r) => ({
        id: r.id,
        label: r.label,
        color: r.color,
        bgColor: r.bgColor,
        dotColor: r.id === 'All' ? '' : ROLE_COLORS[r.id as LoLRole]?.dot || '',
      })) as unknown as GameRoleDef[]
    case 'helldivers2':
      return [
        { id: 'All', label: 'All', color: 'text-foreground', bgColor: 'bg-white/10', dotColor: '' },
        {
          id: 'Primary',
          label: 'Primary',
          color: 'text-orange-400',
          bgColor: 'bg-orange-500/10',
          dotColor: 'bg-orange-400',
        },
        {
          id: 'Secondary',
          label: 'Secondary',
          color: 'text-cyan-400',
          bgColor: 'bg-cyan-500/10',
          dotColor: 'bg-cyan-400',
        },
        {
          id: 'Support',
          label: 'Support',
          color: 'text-amber-400',
          bgColor: 'bg-amber-500/10',
          dotColor: 'bg-amber-400',
        },
      ] as unknown as GameRoleDef[]
    case 'wow':
      return [
        { id: 'All', label: 'All', color: 'text-foreground', bgColor: 'bg-white/10', dotColor: '' },
        {
          id: 'Tank',
          label: 'Tank',
          color: 'text-amber-400',
          bgColor: 'bg-amber-500/10',
          dotColor: 'bg-amber-400',
        },
        {
          id: 'Healer',
          label: 'Healer',
          color: 'text-green-400',
          bgColor: 'bg-green-500/10',
          dotColor: 'bg-green-400',
        },
        {
          id: 'DPS',
          label: 'DPS',
          color: 'text-red-400',
          bgColor: 'bg-red-500/10',
          dotColor: 'bg-red-400',
        },
      ] as unknown as GameRoleDef[]
    case 'rematch':
      return [
        { id: 'All', label: 'All', color: 'text-foreground', bgColor: 'bg-white/10', dotColor: '' },
        {
          id: 'Striker',
          label: 'Striker',
          color: 'text-red-400',
          bgColor: 'bg-red-500/10',
          dotColor: 'bg-red-400',
        },
        {
          id: 'Tank',
          label: 'Tank',
          color: 'text-amber-400',
          bgColor: 'bg-amber-500/10',
          dotColor: 'bg-amber-400',
        },
        {
          id: 'Ranged',
          label: 'Ranged',
          color: 'text-cyan-400',
          bgColor: 'bg-cyan-500/10',
          dotColor: 'bg-cyan-400',
        },
        {
          id: 'Support',
          label: 'Support',
          color: 'text-green-400',
          bgColor: 'bg-green-500/10',
          dotColor: 'bg-green-400',
        },
      ] as unknown as GameRoleDef[]
    case '2xko':
      return [
        { id: 'All', label: 'All', color: 'text-foreground', bgColor: 'bg-white/10', dotColor: '' },
        {
          id: 'Power',
          label: 'Power',
          color: 'text-red-400',
          bgColor: 'bg-red-500/10',
          dotColor: 'bg-red-400',
        },
        {
          id: 'Speed',
          label: 'Speed',
          color: 'text-cyan-400',
          bgColor: 'bg-cyan-500/10',
          dotColor: 'bg-cyan-400',
        },
        {
          id: 'Technical',
          label: 'Technical',
          color: 'text-violet-400',
          bgColor: 'bg-violet-500/10',
          dotColor: 'bg-violet-400',
        },
      ] as unknown as GameRoleDef[]
    default:
      return [
        { id: 'All', label: 'All', color: 'text-foreground', bgColor: 'bg-white/10', dotColor: '' },
        {
          id: 'Default',
          label: 'Default',
          color: 'text-muted-foreground',
          bgColor: 'bg-white/5',
          dotColor: 'bg-muted-foreground',
        },
      ] as unknown as GameRoleDef[]
  }
}

function getRoleColorsForGame(
  gameId: GameId,
): Record<string, { text: string; bg: string; border: string; dot: string }> {
  switch (gameId) {
    case 'valorant':
      return VAL_ROLE_COLORS as unknown as Record<
        string,
        { text: string; bg: string; border: string; dot: string }
      >
    case 'tft':
      return TFT_COST_COLORS
    case 'deadlock':
      return DL_ROLE_COLORS as unknown as Record<
        string,
        { text: string; bg: string; border: string; dot: string }
      >
    case 'dota2':
      return DOTA_ROLE_COLORS as unknown as Record<
        string,
        { text: string; bg: string; border: string; dot: string }
      >
    case 'lol':
      return ROLE_COLORS as unknown as Record<
        string,
        { text: string; bg: string; border: string; dot: string }
      >
    default:
      return {}
  }
}

function getSearchPlaceholder(gameId: GameId): string {
  const map: Record<string, string> = {
    lol: 'Search champions...',
    valorant: 'Search agents...',
    tft: 'Search comps...',
    deadlock: 'Search heroes...',
    dota2: 'Search heroes...',
    helldivers2: 'Search weapons...',
    wow: 'Search specs...',
    rematch: 'Search fighters...',
    '2xko': 'Search fighters...',
  }
  return map[gameId] || 'Search...'
}

function getEntityLabel(gameId: GameId): string {
  const map: Record<string, string> = {
    lol: 'champions',
    valorant: 'agents',
    tft: 'comps',
    deadlock: 'heroes',
    dota2: 'heroes',
    helldivers2: 'weapons',
    wow: 'specs',
    rematch: 'fighters',
    '2xko': 'fighters',
  }
  return map[gameId] || 'entities'
}

function getSecondaryStat(gameId: GameId): string {
  const map: Record<string, string> = {
    valorant: 'KDA',
    deadlock: 'KDA',
    dota2: 'KDA',
    lol: 'KDA',
    tft: 'Top 4',
  }
  return map[gameId] || ''
}

/* ────────────────────────────────────
   GAME DETAIL PAGE
   ──────────────────────────────────── */

function GamePage({
  game,
  activeSection = 'home',
  onBack,
  onSectionChange,
}: {
  game: Game
  activeSection: string
  onBack: () => void
  onSectionChange?: (id: string) => void
}) {
  const Icon = game.icon
  const isComingSoon = game.isComingSoon || false

  // Fetch live stats for this game
  const {
    data: liveStats,
    isLoading: statsLoading,
    refetch,
  } = useGameStats({
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
      <motion.div
        key={game.id}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-16">
          {activeSection === 'home' &&
            (statsLoading && !liveStats ? (
              <DashboardLoadingSkeleton />
            ) : dynamicConfig ? (
              <GameDashboardHome
                config={dynamicConfig}
                lastUpdated={liveStats?.lastUpdated}
                source={liveStats?.source}
                isLoading={statsLoading}
                onRefresh={() => refetch()}
              />
            ) : null)}
          {activeSection !== 'home' && (
            <>
              {activeSection === 'champions' && <LoLChampionsSection />}
              {activeSection === 'builds' && <LoLBuildsSection />}
              {activeSection === 'runes' && <LoLRunesSection />}
              {activeSection === 'counters' && <LoLCountersSection />}
              {activeSection === 'pro-builds' && <LoLProBuildsSection />}
              {activeSection === 'tier-list' && <LoLTierListSection />}
              {activeSection === 'leaderboards' && <LoLLeaderboardsSection />}
              {activeSection === 'live-game' && <LoLLiveGameSection />}
            </>
          )}
        </main>
        <Footer />
      </motion.div>
    )
  }

  // Active games with rich dashboard home (valorant, tft, deadlock, dota2)
  if (dynamicConfig && !isComingSoon) {
    return (
      <motion.div
        key={game.id}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        {activeSection === 'home' ? (
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-16">
            {statsLoading && !liveStats ? (
              <DashboardLoadingSkeleton />
            ) : (
              <GameDashboardHome
                config={dynamicConfig}
                lastUpdated={liveStats?.lastUpdated}
                source={liveStats?.source}
                isLoading={statsLoading}
                onRefresh={() => refetch()}
              />
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
                  <p className="text-sm text-muted-foreground mb-4">
                    This section will be available soon for {game.name}.
                  </p>
                  <Button variant="outline" size="sm" onClick={() => onSectionChange?.('home')}>
                    <HomeIcon className="w-3.5 h-3.5 mr-1.5" />
                    {game.shortName} Home
                  </Button>
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
        <motion.div
          key={game.id}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-16">
            {statsLoading && !liveStats ? (
              <DashboardLoadingSkeleton />
            ) : (
              <GameDashboardHome
                config={dynamicConfig}
                lastUpdated={liveStats?.lastUpdated}
                source={liveStats?.source}
                isLoading={statsLoading}
                onRefresh={() => refetch()}
              />
            )}
          </main>
          <Footer />
        </motion.div>
      )
    }
    return (
      <motion.div
        key={game.id}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-16">
          {statsLoading ? (
            <DashboardLoadingSkeleton />
          ) : (
            <ComingSoonSection game={game} onBack={onBack} />
          )}
        </main>
        <Footer />
      </motion.div>
    )
  }

  // Generic fallback (should not be reached if homeConfigMap is complete)
  return (
    <motion.div
      key={game.id}
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
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
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
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
                <p className="text-sm text-muted-foreground mb-4">
                  More tools for {game.name} are in development.
                </p>
                <Button variant="outline" size="sm" onClick={onBack}>
                  <HomeIcon className="w-3.5 h-3.5 mr-1.5" />
                  All Games
                </Button>
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
  isComingSoon?: boolean
}

function CommandPalette({
  open,
  onClose,
  onSelectGame,
}: {
  open: boolean
  onClose: () => void
  onSelectGame: (id: GameId) => void
}) {
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
    GAMES.forEach((g) => {
      results.push({ id: `game-${g.id}`, type: 'game', name: g.name, sub: g.tagline, gameId: g.id })
    })
    // LoL champions
    LOL_CHAMPIONS.forEach((c) => {
      results.push({
        id: `lol-${c.name}`,
        type: 'champion',
        name: c.name,
        sub: `LoL ${c.role} — ${c.winrate}% WR`,
        gameId: 'lol',
        tier: c.tier,
        winrate: c.winrate,
      })
    })
    // Valorant agents
    VALORANT_AGENTS.forEach((a) => {
      results.push({
        id: `val-${a.name}`,
        type: 'agent',
        name: a.name,
        sub: `Valorant ${a.role} — ${a.winrate}% WR`,
        gameId: 'valorant',
        tier: a.tier,
        winrate: a.winrate,
      })
    })
    // TFT comps
    TFT_COMPS.forEach((c) => {
      results.push({
        id: `tft-${c.name}`,
        type: 'comp',
        name: c.name,
        sub: `TFT ${c.difficulty} — ${c.placementRate}% T4`,
        gameId: 'tft',
        tier: c.tier,
        winrate: c.placementRate,
      })
    })
    // Deadlock heroes
    DEADLOCK_HEROES.forEach((h) => {
      results.push({
        id: `dl-${h.name}`,
        type: 'hero',
        name: h.name,
        sub: `Deadlock ${h.role} — ${h.winrate}% WR`,
        gameId: 'deadlock',
        tier: h.tier,
        winrate: h.winrate,
      })
    })
    // Dota2 heroes
    DOTA2_HEROES.forEach((h) => {
      results.push({
        id: `dota-${h.name}`,
        type: 'hero',
        name: h.name,
        sub: `Dota 2 ${h.role} — ${h.winrate}% WR`,
        gameId: 'dota2',
        tier: h.tier,
        winrate: h.winrate,
      })
    })
    return results
  }, [])

  const filtered = useMemo(() => {
    if (!query.trim()) {
      // Show games + top 8 trending entities
      const trending = allResults
        .filter((r) => r.type !== 'game')
        .sort((a, b) => (b.winrate || 0) - (a.winrate || 0))
        .slice(0, 8)
      return [...allResults.filter((r) => r.type === 'game'), ...trending]
    }
    const q = query.toLowerCase()
    return allResults
      .filter((r) => r.name.toLowerCase().includes(q) || r.sub.toLowerCase().includes(q))
      .slice(0, 12)
  }, [query, allResults])

  const tierColorMap: Record<string, string> = {
    S: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
    A: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    B: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    C: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
  }

  const typeIconMap: Record<string, typeof Swords> = {
    game: Gamepad2,
    champion: Swords,
    agent: Crosshair,
    hero: Zap,
    comp: Crown,
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />
          <motion.div
            className="fixed inset-x-0 top-[15vh] z-[101] mx-auto max-w-xl px-4"
            initial={{ opacity: 0, y: -20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
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
                    <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                      Quick Access
                    </span>
                  </div>
                )}
                {filtered.map((result) => {
                  const TypeIcon = typeIconMap[result.type] || Swords
                  const game = GAMES.find((g) => g.id === result.gameId)
                  const accent = ACCENT_MAP[game?.accentColor || 'emerald'] || ACCENT_MAP.emerald
                  return (
                    <button
                      key={result.id}
                      onClick={() => {
                        onSelectGame(result.gameId)
                        onClose()
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.04] transition-colors cursor-pointer text-left group"
                    >
                      <div
                        className={`w-8 h-8 rounded-lg ${accent.bg} border ${accent.border} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}
                      >
                        <TypeIcon className={`w-3.5 h-3.5 ${accent.text}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold truncate">{result.name}</span>
                          {result.tier && (
                            <span
                              className={`text-[8px] px-1 py-px rounded font-bold border ${tierColorMap[result.tier]}`}
                            >
                              {result.tier}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-muted-foreground truncate">
                          {result.sub}
                        </span>
                      </div>
                      {result.type === 'game' && (
                        <span className="text-[9px] text-muted-foreground/50">
                          {result.isComingSoon ? 'Coming Soon' : 'Open'}
                        </span>
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
                <span className="text-[9px] text-muted-foreground/50 flex items-center gap-1">
                  <Keyboard className="w-2.5 h-2.5" />
                  ↑↓ Navigate
                </span>
                <span className="text-[9px] text-muted-foreground/50 flex items-center gap-1">
                  <span className="px-1 py-px rounded border border-white/[0.06] bg-white/[0.03] text-[8px]">
                    ↵
                  </span>{' '}
                  Select
                </span>
                <span className="text-[9px] text-muted-foreground/50 flex items-center gap-1">
                  <span className="px-1 py-px rounded border border-white/[0.06] bg-white/[0.03] text-[8px]">
                    esc
                  </span>{' '}
                  Close
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
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

  const selectedGame = GAMES.find((g) => g.id === selectedGameId) ?? null

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
    setSidebarExpanded((prev) => !prev)
  }, [])

  const toggleMobileSidebar = useCallback(() => {
    setMobileSidebarOpen((prev) => !prev)
  }, [])

  // Global Cmd+K listener
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCommandPaletteOpen((prev) => !prev)
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
            <GamePage
              key={selectedGame.id}
              game={selectedGame}
              activeSection={activeSection}
              onBack={goHome}
              onSectionChange={setActiveSection}
            />
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
          style: {
            background: '#18181b',
            border: '1px solid rgba(255,255,255,0.08)',
            color: '#e4e4e7',
            fontSize: '13px',
          },
        }}
      />
    </div>
  )
}

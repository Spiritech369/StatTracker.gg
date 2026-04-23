'use client'

import { motion } from 'framer-motion'
import {
  ArrowRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Crown,
  Flame,
  Search,
  Star,
  Target,
  TrendingUp,
} from 'lucide-react'
import { useState } from 'react'
import { FadeIn, LiveIndicator, StaggerContainer, StaggerItem } from '@/components/animations'
import { DashboardCharts } from '@/components/dashboard-charts'
import { WinRateBar } from '@/components/dashboard-primitives'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  ACCENT_MAP,
  type GameEntity,
  type GameHomeConfig,
  type RoleColorPalette,
} from '@/features/games/dashboard-types'
import { TIER_STYLES } from '@/features/lol/constants'

export function GameDashboardHome({
  config,
  lastUpdated,
  source,
  isLoading,
  onRefresh,
}: {
  config: GameHomeConfig
  lastUpdated?: number
  source?: string
  isLoading?: boolean
  onRefresh?: () => void
}) {
  const {
    game,
    entities,
    roles,
    roleColors,
    patchLabel,
    searchPlaceholder,
    entityLabel,
    entityIcon,
    secondaryStatLabel,
    showKda,
    showPlacement,
    showBanRate,
    metaInsights,
  } = config
  const accent = ACCENT_MAP[game.accentColor] || ACCENT_MAP.emerald
  const Icon = game.icon

  const [roleFilter, setRoleFilter] = useState<string>('All')
  const [search, setSearch] = useState('')

  const filtered = entities
    .filter((e) => {
      if (roleFilter !== 'All' && e.role !== roleFilter) return false
      if (search && !e.name.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
    .sort((a, b) => {
      const tierOrder: Record<string, number> = { S: 0, A: 1, B: 2, C: 3 }
      if (tierOrder[a.tier] !== tierOrder[b.tier]) return tierOrder[a.tier] - tierOrder[b.tier]
      return b.winrate - a.winrate
    })

  const bestWR = entities.reduce((a, b) => (a.winrate > b.winrate ? a : b))
  const mostPicked = entities.reduce((a, b) => (a.pickrate > b.pickrate ? a : b))
  const sTierCount = entities.filter((e) => e.tier === 'S').length
  const trending = entities
    .filter((e) => e.trend === 'up')
    .sort((a, b) => b.trendChange - a.trendChange)
    .slice(0, 6)

  const roleOnlyDefs = roles.filter((r) => r.id !== 'All')
  const bestByRole = roleOnlyDefs
    .map((rd) => {
      const ents = entities.filter((e) => e.role === rd.id)
      if (ents.length === 0) return null
      const best = ents.reduce((a, b) => (a.winrate > b.winrate ? a : b))
      return { ...best, roleColor: roleColors[best.role] || roleColors[rd.id] }
    })
    .filter(Boolean) as (GameEntity & { roleColor: RoleColorPalette })[]

  const sTierEntities = entities.filter((e) => e.tier === 'S')

  return (
    <>
      {/* ── Hero Banner ── */}
      <FadeIn>
        <div className="relative rounded-xl overflow-hidden mb-5">
          <div className={`absolute inset-0 bg-gradient-to-br ${accent.gradient}`} />
          <div className="absolute inset-0 bg-[#09090b]/40" />
          <div className="absolute top-4 right-4 opacity-[0.06]">
            <Icon className="w-32 h-32" />
          </div>
          <div className="relative z-10 p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-lg ${accent.bg} border ${accent.border} flex items-center justify-center`}
                >
                  <Icon className={`w-4 h-4 ${accent.text}`} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-base font-bold tracking-tight">{game.name}</h1>
                    <Badge
                      className={`${accent.bg} ${accent.text} ${accent.border} text-[9px] font-semibold px-1.5 py-0`}
                    >
                      {patchLabel}
                    </Badge>
                    {lastUpdated && (
                      <LiveIndicator
                        lastUpdated={lastUpdated}
                        source={source}
                        isLoading={isLoading}
                        onRefresh={onRefresh}
                      />
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
            {
              label: 'Best Win Rate',
              value: `${bestWR.winrate}%`,
              sub: bestWR.name,
              role: bestWR.role,
              icon: Flame,
              color: 'text-emerald-400',
              bg: 'bg-emerald-500/[0.04]',
            },
            {
              label: 'Most Picked',
              value: `${mostPicked.pickrate}%`,
              sub: mostPicked.name,
              role: mostPicked.role,
              icon: Target,
              color: 'text-cyan-400',
              bg: 'bg-cyan-500/[0.04]',
            },
            {
              label: `S-Tier ${entityLabel}`,
              value: `${sTierCount}`,
              sub: `${sTierCount} top picks`,
              role: null,
              icon: Crown,
              color: 'text-yellow-400',
              bg: 'bg-yellow-500/[0.04]',
            },
            {
              label: 'Trending Up',
              value: `${trending.length}+`,
              sub: `${entityLabel} rising`,
              role: null,
              icon: ArrowUpRight,
              color: accent.text,
              bg: accent.bg,
            },
          ].map((s) => {
            const rc = s.role ? roleColors[s.role] : null
            return (
              <div
                key={s.label}
                className={`group flex items-center gap-2 p-2 rounded-lg ${s.bg} hover:bg-white/[0.04] transition-all cursor-pointer`}
              >
                <s.icon className={`w-3.5 h-3.5 ${s.color} shrink-0`} />
                <div className="min-w-0 flex-1">
                  <div className={`text-xs font-bold ${s.color} leading-tight`}>{s.value}</div>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-muted-foreground truncate">{s.sub}</span>
                    {rc && (
                      <span
                        className={`text-[8px] px-0.5 py-px rounded font-semibold ${rc.bg} ${rc.text} border ${rc.border}`}
                      >
                        {s.role}
                      </span>
                    )}
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
            <div
              className={`grid gap-1.5 ${bestByRole.length <= 5 ? 'grid-cols-5' : bestByRole.length <= 6 ? 'grid-cols-3 sm:grid-cols-6' : 'grid-cols-3 sm:grid-cols-4 lg:grid-cols-6'}`}
            >
              {bestByRole.map(({ role, name, winrate, roleColor }) => {
                if (!roleColor) return null
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setRoleFilter(role)}
                    className={`group flex items-center gap-2 p-2 rounded-lg border transition-all cursor-pointer ${
                      roleFilter === role
                        ? `${roleColor.bg} ${roleColor.border} border`
                        : 'bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.04] hover:border-white/[0.1]'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-full ${roleColor.bg} border ${roleColor.border} flex items-center justify-center text-[10px] font-bold ${roleColor.text} shrink-0 group-hover:scale-105 transition-transform`}
                    >
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
                  type="button"
                  onClick={() => setRoleFilter(role.id)}
                  className={`relative flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap transition-all duration-150 cursor-pointer shrink-0 ${
                    isActive
                      ? 'bg-white/[0.08] text-foreground'
                      : 'text-muted-foreground/60 hover:text-foreground hover:bg-white/[0.04]'
                  }`}
                >
                  {!isAll && role.dotColor && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${role.dotColor} ${isActive ? 'shadow-sm' : 'opacity-40'}`}
                    />
                  )}
                  {role.label}
                  {isActive && (
                    <motion.div
                      layoutId={`gdh-tab-${game.id}`}
                      className={`absolute bottom-0 left-1 right-1 h-0.5 ${accent.primary} rounded-full`}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </button>
              )
            })}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground whitespace-nowrap">
              {filtered.length} {entityLabel}
            </span>
            <div className="flex items-center gap-0.5">
              {['S', 'A', 'B', 'C'].map((t) => {
                const count = filtered.filter((e) => e.tier === t).length
                const tc = TIER_STYLES[t]
                return (
                  <span
                    key={t}
                    className={`text-[9px] font-bold px-1 py-0.5 rounded ${tc.bg} ${tc.text} border ${tc.border}`}
                  >
                    {t}: {count}
                  </span>
                )
              })}
            </div>
          </div>
        </div>
        <StaggerContainer className="rounded-xl border border-white/[0.06] bg-white/[0.01] overflow-hidden divide-y divide-white/[0.03]">
          {filtered.map((entity) => {
            const rc = roleColors[entity.role] || {
              text: 'text-muted-foreground',
              bg: 'bg-white/10',
              border: 'border-white/[0.1]',
              dot: 'bg-muted-foreground',
            }
            const ts = TIER_STYLES[entity.tier]
            const wrColor =
              entity.winrate >= 52
                ? 'text-emerald-400'
                : entity.winrate >= 50
                  ? 'text-foreground'
                  : 'text-rose-400'
            const tierDotColor =
              entity.tier === 'S'
                ? 'bg-yellow-400'
                : entity.tier === 'A'
                  ? 'bg-emerald-400'
                  : entity.tier === 'B'
                    ? 'bg-blue-400'
                    : 'bg-violet-400'
            const TrendIcon =
              entity.trend === 'up' ? ChevronRight : entity.trend === 'down' ? ChevronLeft : null
            const trendColor =
              entity.trend === 'up'
                ? 'text-emerald-400'
                : entity.trend === 'down'
                  ? 'text-rose-400'
                  : 'text-muted-foreground'
            const isSTier = entity.tier === 'S'
            const displayValue = showPlacement
              ? entity.placementRate || entity.winrate
              : entity.winrate
            const displayLabel = showPlacement ? 'Top4' : 'WR'

            return (
              <StaggerItem key={entity.name}>
                <div
                  className={`group flex items-center gap-2.5 px-3 py-2 hover:bg-white/[0.03] transition-all cursor-pointer border-b border-transparent hover:border-white/[0.04] ${isSTier ? 'border-l-2 border-l-yellow-500/30' : ''}`}
                >
                  <div className="relative shrink-0">
                    <div
                      className={`w-8 h-8 rounded-full ${rc.bg} border ${rc.border} flex items-center justify-center text-xs font-bold ${rc.text} group-hover:scale-105 transition-transform ${isSTier ? 'ring-1 ring-yellow-500/20' : ''}`}
                    >
                      {entityIcon || entity.name.charAt(0)}
                    </div>
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ${tierDotColor} border-2 border-[#09090b] flex items-center justify-center`}
                    >
                      <span className="text-[6px] font-black text-black leading-none">
                        {entity.tier}
                      </span>
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold truncate group-hover:text-foreground transition-colors">
                        {entity.name}
                      </span>
                      <span
                        className={`text-[9px] px-1 py-px rounded font-medium ${rc.bg} ${rc.text} border ${rc.border} leading-none`}
                      >
                        {entity.role}
                      </span>
                      {entity.difficulty && (
                        <span
                          className={`text-[8px] px-1 py-px rounded font-medium leading-none ${entity.difficulty === 'Easy' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : entity.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}
                        >
                          {entity.difficulty}
                        </span>
                      )}
                    </div>
                    {entity.carryUnits && entity.carryUnits.length > 0 && (
                      <div className="flex items-center gap-0.5 mt-0.5">
                        {entity.carryUnits.slice(0, 3).map((u) => (
                          <span
                            key={u}
                            className="text-[8px] text-muted-foreground/60 bg-white/[0.03] px-1 py-px rounded"
                          >
                            {u}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-[11px] font-bold ${wrColor}`}>{displayValue}%</span>
                      <WinRateBar
                        value={displayValue}
                        max={showPlacement ? 35 : 55}
                        min={showPlacement ? 15 : 45}
                      />
                      <span className="text-[9px] text-muted-foreground/40">{displayLabel}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0 flex items-center gap-2">
                    {showKda && entity.kda && (
                      <span className="text-[10px] text-muted-foreground hidden sm:inline">
                        {secondaryStatLabel || 'KDA'}: {entity.kda}
                      </span>
                    )}
                    {showBanRate && entity.banrate && (
                      <span className="text-[10px] text-muted-foreground/60 hidden md:inline">
                        {entity.banrate}% BR
                      </span>
                    )}
                    <span className="text-[10px] text-muted-foreground hidden sm:inline">
                      {entity.pickrate}% PR
                    </span>
                    {TrendIcon && (
                      <span
                        className={`text-[10px] font-semibold ${trendColor} flex items-center gap-0.5`}
                      >
                        <TrendIcon className="w-2.5 h-2.5" />
                        {entity.trendChange > 0 ? '+' : ''}
                        {entity.trendChange}%
                      </span>
                    )}
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
      <DashboardCharts
        entities={entities}
        entityLabel={entityLabel}
        accent={accent}
        roleColors={roleColors}
        showPlacement={showPlacement}
      />

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
          <div className="lg:col-span-2">
            <div className="rounded-lg border border-white/[0.06] bg-white/[0.01] overflow-hidden">
              <div className="px-3 py-2 border-b border-white/[0.04] bg-white/[0.02]">
                <h3
                  className={`text-[10px] font-semibold flex items-center gap-1 ${accent.text} uppercase tracking-wider`}
                >
                  <ArrowUpRight className="w-3 h-3" />
                  Rising {entityLabel.charAt(0).toUpperCase() + entityLabel.slice(1)}
                </h3>
              </div>
              <div className="divide-y divide-white/[0.03] max-h-80 overflow-y-auto">
                {trending.map((entity, i) => {
                  const rc = roleColors[entity.role] || {
                    text: 'text-muted-foreground',
                    bg: 'bg-white/10',
                    border: 'border-white/[0.1]',
                    dot: 'bg-muted-foreground',
                  }
                  const ts = TIER_STYLES[entity.tier]
                  const wrColor =
                    entity.winrate >= 52
                      ? 'text-emerald-400'
                      : entity.winrate >= 50
                        ? 'text-foreground'
                        : 'text-rose-400'
                  const tierDotColor =
                    entity.tier === 'S'
                      ? 'bg-yellow-400'
                      : entity.tier === 'A'
                        ? 'bg-emerald-400'
                        : entity.tier === 'B'
                          ? 'bg-blue-400'
                          : 'bg-violet-400'
                  return (
                    <div
                      key={entity.name}
                      className="group flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/[0.03] transition-all cursor-pointer"
                    >
                      <span className="text-[11px] font-bold text-muted-foreground/50 w-5 text-right shrink-0">
                        {i + 1}
                      </span>
                      <div
                        className={`w-9 h-9 rounded-lg ${rc.bg} border ${rc.border} flex items-center justify-center text-sm font-bold ${rc.text} shrink-0 group-hover:scale-105 transition-transform`}
                      >
                        {entityIcon || entity.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold truncate">{entity.name}</span>
                          <span className={`w-1.5 h-1.5 rounded-full ${tierDotColor}`} />
                          <span className={`text-[10px] font-bold ${ts.text}`}>{entity.tier}</span>
                        </div>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className={`text-xs font-semibold ${wrColor}`}>
                            {entity.winrate}%
                          </span>
                          <WinRateBar value={entity.winrate} />
                        </div>
                      </div>
                      <div className="text-right shrink-0 flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground hidden sm:inline">
                          {entity.pickrate}% PR
                        </span>
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

          <div className="space-y-3">
            <div className="rounded-lg border border-yellow-500/15 bg-yellow-500/[0.02] overflow-hidden">
              <div className="px-3 py-2 border-b border-yellow-500/10 bg-yellow-500/[0.03]">
                <h3 className="text-[10px] font-semibold flex items-center gap-1 text-yellow-400 uppercase tracking-wider">
                  <Crown className="w-3 h-3" />
                  S-Tier {entityLabel.charAt(0).toUpperCase() + entityLabel.slice(1)}
                </h3>
              </div>
              <div className="p-2 space-y-0.5 max-h-48 overflow-y-auto">
                {sTierEntities.map((e) => {
                  const rc = roleColors[e.role] || {
                    text: 'text-muted-foreground',
                    bg: 'bg-white/10',
                    border: 'border-white/[0.1]',
                    dot: 'bg-muted-foreground',
                  }
                  return (
                    <div
                      key={e.name}
                      className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-white/[0.04] transition-colors cursor-pointer"
                    >
                      <div
                        className={`w-6 h-6 rounded-full ${rc.bg} border ${rc.border} flex items-center justify-center text-[9px] font-bold ${rc.text} shrink-0`}
                      >
                        {entityIcon || e.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-semibold truncate">{e.name}</span>
                        <span className="text-[9px] text-muted-foreground ml-1">{e.role}</span>
                      </div>
                      <span className="text-[10px] font-bold text-yellow-400">
                        {showPlacement ? `${e.placementRate}%` : `${e.winrate}%`}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {metaInsights?.map((insight) => (
              <div
                key={insight.title}
                className="rounded-lg border border-white/[0.06] bg-white/[0.01] overflow-hidden"
              >
                <div className="px-3 py-2 border-b border-white/[0.04] bg-white/[0.02]">
                  <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {insight.title}
                  </h3>
                </div>
                <div className="p-2 space-y-0.5">
                  {insight.items.map((item) => (
                    <div
                      key={`${insight.title}-${item.label}`}
                      className="flex items-center justify-between px-2 py-1.5 rounded hover:bg-white/[0.03] transition-colors cursor-pointer"
                    >
                      <div className="min-w-0">
                        <div className="text-[10px] font-medium truncate">{item.label}</div>
                        {item.sublabel && (
                          <div className="text-[9px] text-muted-foreground">{item.sublabel}</div>
                        )}
                      </div>
                      <span className={`text-[10px] font-bold shrink-0 ml-2 ${accent.text}`}>
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="rounded-lg border border-white/[0.06] bg-white/[0.01] overflow-hidden">
              <div className="px-3 py-2 border-b border-white/[0.04] bg-white/[0.02]">
                <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Role Averages
                </h3>
              </div>
              <div className="p-2 space-y-0.5 max-h-48 overflow-y-auto">
                {roleOnlyDefs.map((rd) => {
                  const ents = entities.filter((e) => e.role === rd.id)
                  if (ents.length === 0) return null
                  const avgWR = ents.reduce((a, b) => a + b.winrate, 0) / ents.length
                  const best = ents.reduce((a, b) => (a.winrate > b.winrate ? a : b))
                  const rc = roleColors[rd.id]
                  if (!rc) return null
                  return (
                    <div
                      key={rd.id}
                      className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-white/[0.03] transition-colors cursor-pointer"
                    >
                      <div className={`w-1.5 h-6 rounded-full ${rc.dot}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-[11px] font-medium">{rd.label}</span>
                          <span
                            className={`text-[10px] font-bold ${avgWR >= 51 ? 'text-emerald-400' : 'text-foreground'}`}
                          >
                            {avgWR.toFixed(1)}%
                          </span>
                        </div>
                        <WinRateBar value={avgWR} max={55} min={45} />
                        <span className="text-[9px] text-muted-foreground/50">
                          Best: {best.name}
                        </span>
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
        <div
          className={`flex items-center justify-between gap-4 p-4 rounded-lg ${accent.bg} ${accent.border} border`}
        >
          <div>
            <h2 className="text-xs font-bold">Want to climb faster?</h2>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Get optimized builds, counters, live tracking & AI coaching for {game.name}.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="sm"
              className={`${accent.button} ${accent.buttonHover} text-black font-bold h-7 text-[11px] px-3`}
            >
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

'use client'

import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  ChevronRight,
  Crown,
  Eye,
  Flame,
  Search,
  Shield,
  Sparkles,
  Star,
  Swords,
  Target,
  TrendingUp,
  Wrench,
} from 'lucide-react'
import { useState } from 'react'
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/animations'
import { ChampionCard, RoleFilterTabs, WinRateBar } from '@/components/dashboard-primitives'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { GAMES } from '@/features/games/data'
import { type LoLRole, ROLE_COLORS, TIER_STYLES } from '@/features/lol/constants'
import { LOL_CHAMPIONS, LOL_ITEMS, LOL_PRO_BUILDS } from '@/features/lol/data'
export function LoLHomeSection() {
  const [roleFilter, setRoleFilter] = useState<LoLRole | 'All'>('All')
  const [search, setSearch] = useState('')
  const filtered = LOL_CHAMPIONS.filter((c) => {
    if (roleFilter !== 'All' && c.role !== roleFilter) return false
    if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  }).sort((a, b) => {
    const tierOrder = { S: 0, A: 1, B: 2, C: 3 }
    if (tierOrder[a.tier] !== tierOrder[b.tier]) return tierOrder[a.tier] - tierOrder[b.tier]
    return b.winrate - a.winrate
  })

  const bestWR = LOL_CHAMPIONS.reduce((a, b) => (a.winrate > b.winrate ? a : b))
  const mostBanned = LOL_CHAMPIONS.reduce((a, b) => (a.banrate > b.banrate ? a : b))
  const mostPicked = LOL_CHAMPIONS.reduce((a, b) => (a.pickrate > b.pickrate ? a : b))
  const trending = LOL_CHAMPIONS.filter((c) => c.trend === 'up')
    .sort((a, b) => b.trendChange - a.trendChange)
    .slice(0, 6)
  const sTierChamps = LOL_CHAMPIONS.filter((c) => c.tier === 'S')

  // Get best champ per role
  const bestByRole = (['Top', 'Jungle', 'Mid', 'ADC', 'Support'] as LoLRole[]).map((role) => {
    const champs = LOL_CHAMPIONS.filter((c) => c.role === role)
    const best = champs.reduce((a, b) => (a.winrate > b.winrate ? a : b))
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
                <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/25 text-[9px] font-semibold px-1.5 py-0">
                  Patch 15.5
                </Badge>
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
              label: 'Most Banned',
              value: `${mostBanned.banrate}%`,
              sub: mostBanned.name,
              role: mostBanned.role,
              icon: Shield,
              color: 'text-rose-400',
              bg: 'bg-rose-500/[0.04]',
            },
            {
              label: 'Games Tracked',
              value: '2.5M+',
              sub: 'This patch',
              role: null,
              icon: BarChart3,
              color: 'text-amber-400',
              bg: 'bg-amber-500/[0.04]',
            },
          ].map((s) => {
            const rc = s.role ? ROLE_COLORS[s.role] : null
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
                  <div
                    className={`w-7 h-7 rounded-full ${rc.bg} border ${rc.border} flex items-center justify-center text-[10px] font-bold ${rc.text} shrink-0 group-hover:scale-105 transition-transform`}
                  >
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
            <span className="text-[10px] text-muted-foreground whitespace-nowrap">
              {filtered.length} champions
            </span>
            <div className="flex items-center gap-0.5">
              {['S', 'A', 'B', 'C'].map((t) => {
                const count = filtered.filter((c) => c.tier === t).length
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
          {filtered.map((c, i) => (
            <StaggerItem key={c.name}>
              <ChampionCard champ={c} index={i} />
            </StaggerItem>
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
                <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Role Win Rates
                </h3>
              </div>
              <div className="p-2 space-y-0.5">
                {(['Top', 'Jungle', 'Mid', 'ADC', 'Support'] as LoLRole[]).map((role) => {
                  const champs = LOL_CHAMPIONS.filter((c) => c.role === role)
                  const avgWR = champs.reduce((a, b) => a + b.winrate, 0) / champs.length
                  const best = champs.reduce((a, b) => (a.winrate > b.winrate ? a : b))
                  const rc = ROLE_COLORS[role]
                  return (
                    <div
                      key={role}
                      className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-white/[0.03] transition-colors cursor-pointer"
                    >
                      <div className={`w-1.5 h-6 rounded-full ${rc.dot}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-[11px] font-medium">{role}</span>
                          <span
                            className={`text-[10px] font-bold ${avgWR >= 51 ? 'text-emerald-400' : 'text-foreground'}`}
                          >
                            {avgWR.toFixed(1)}%
                          </span>
                        </div>
                        <WinRateBar value={avgWR} max={53} min={48} />
                        <span className="text-[9px] text-muted-foreground/50">
                          Best: {best.name}
                        </span>
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
                {sTierChamps.map((c) => {
                  const rc = ROLE_COLORS[c.role]
                  return (
                    <div
                      key={c.name}
                      className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-white/[0.04] transition-colors cursor-pointer"
                    >
                      <div
                        className={`w-6 h-6 rounded-full ${rc.bg} border ${rc.border} flex items-center justify-center text-[9px] font-bold ${rc.text} shrink-0`}
                      >
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
                {LOL_PRO_BUILDS.slice(0, 3).map((pb) => {
                  const rc = ROLE_COLORS[pb.role as LoLRole]
                  return (
                    <div
                      key={pb.player}
                      className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-white/[0.03] transition-colors cursor-pointer"
                    >
                      <div
                        className={`w-6 h-6 rounded-full ${rc.bg} border ${rc.border} flex items-center justify-center text-[9px] font-bold ${rc.text} shrink-0`}
                      >
                        {pb.champion.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] font-semibold truncate">{pb.player}</div>
                        <div className="text-[9px] text-muted-foreground">
                          {pb.champion} · {pb.team}
                        </div>
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
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Get optimized builds, counters, live tracking & AI coaching.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="sm"
              className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold h-7 text-[11px] px-3"
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

export function LoLChampionsSection() {
  const [roleFilter, setRoleFilter] = useState<LoLRole | 'All'>('All')
  const [search, setSearch] = useState('')
  const filtered = LOL_CHAMPIONS.filter((c) => {
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
                {['S', 'A', 'B', 'C'].map((t) => {
                  const count = filtered.filter((c) => c.tier === t).length
                  const tc = TIER_STYLES[t]
                  return (
                    <span
                      key={t}
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${tc.bg} ${tc.text} border ${tc.border}`}
                    >
                      {t}: {count}
                    </span>
                  )
                })}
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Win rate, pick rate, ban rate & trends by role
            </p>
          </div>
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Search champion..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 pl-9 pr-4 bg-white/[0.06] border-white/[0.08] text-xs sm:w-56 placeholder:text-muted-foreground/50 focus:border-emerald-500/30"
            />
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
              <StaggerItem key={c.name}>
                <ChampionCard champ={c} index={i} />
              </StaggerItem>
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

export function LoLBuildsSection() {
  const featured = LOL_CHAMPIONS.find((c) => c.name === 'Aatrox')!
  const rc = ROLE_COLORS[featured.role]
  return (
    <>
      <FadeIn>
        <h1 className="text-2xl font-bold tracking-tight mb-1">Builds</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Las mejores builds basadas en datos de millones de partidas
        </p>
      </FadeIn>
      <FadeIn delay={0.1}>
        <Card className="border-white/[0.06] py-0 max-w-4xl">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-xl ${rc.bg} border ${rc.border} flex items-center justify-center text-base font-bold ${rc.text}`}
              >
                {featured.name.charAt(0)}
              </div>
              <div>
                <CardTitle className="text-lg">{featured.name}</CardTitle>
                <CardDescription>
                  Build más popular · {featured.role} · {featured.winrate}% Win Rate
                </CardDescription>
              </div>
              <span
                className={`ml-auto text-xs font-bold px-2 py-0.5 rounded border ${TIER_STYLES[featured.tier].bg} ${TIER_STYLES[featured.tier].text} ${TIER_STYLES[featured.tier].border}`}
              >
                {featured.tier} Tier
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Item Build Path */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                Build Path
              </h3>
              <div className="flex items-center gap-2">
                {LOL_ITEMS.map((item, i) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center group hover:bg-white/[0.08] transition-colors cursor-pointer relative">
                      <div className="absolute -top-1.5 -left-1.5 w-4 h-4 rounded-full bg-background border border-border flex items-center justify-center text-[9px] font-bold text-muted-foreground">
                        {i + 1}
                      </div>
                      <Wrench className="w-4 h-4 text-muted-foreground/40" />
                    </div>
                    {i < LOL_ITEMS.length - 1 && (
                      <ChevronRight className="w-3 h-3 text-muted-foreground/40" />
                    )}
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {LOL_ITEMS.map((item) => (
                  <span
                    key={item.name}
                    className="text-[10px] text-muted-foreground bg-white/[0.03] px-2 py-0.5 rounded"
                  >
                    {item.name} · <span className="text-foreground font-medium">{item.gold}g</span>
                  </span>
                ))}
              </div>
            </div>
            {/* Skill Order */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                Orden de habilidades
              </h3>
              <div className="flex items-center gap-4">
                {['Q', 'W', 'E', 'R'].map((skill, i) => {
                  const maxed = [3, 2, 1, 0].indexOf(i) + 1
                  return (
                    <div key={skill} className="flex flex-col items-center gap-1">
                      <div
                        className={`w-10 h-10 rounded-lg border flex items-center justify-center text-sm font-bold ${i < 3 ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'}`}
                      >
                        {skill}
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        Max {maxed > 0 ? maxed : '→'}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
            {/* Summoner Spells */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                Hechizos de invocador
              </h3>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center text-xs font-bold text-red-400">
                  IG
                </div>
                <div className="w-10 h-10 rounded-lg bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center text-xs font-bold text-yellow-400">
                  FL
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </FadeIn>
    </>
  )
}

export function LoLRunesSection() {
  const featured = LOL_CHAMPIONS.find((c) => c.name === 'Orianna')!
  const rc = ROLE_COLORS[featured.role]
  return (
    <>
      <FadeIn>
        <h1 className="text-2xl font-bold tracking-tight mb-1">Runas</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Páginas de runas más efectivas por campeón
        </p>
      </FadeIn>
      <FadeIn delay={0.1}>
        <Card className="border-white/[0.06] py-0 max-w-4xl">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-xl ${rc.bg} border ${rc.border} flex items-center justify-center text-base font-bold ${rc.text}`}
              >
                {featured.name.charAt(0)}
              </div>
              <div>
                <CardTitle className="text-lg">{featured.name} Runas</CardTitle>
                <CardDescription>Página más popular · {featured.winrate}% Win Rate</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Primary Tree */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                Árbol Primario · Brujería
              </h3>
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-2.5 rounded-lg bg-emerald-500/[0.06] border border-emerald-500/20">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold">Cometa Arcano</div>
                    <div className="text-[10px] text-emerald-400">Keystone · 62.3% pick</div>
                  </div>
                </div>
                {[
                  { n: 'Banda de Maná', p: '48.1%' },
                  { n: 'Trascendencia', p: '51.2%' },
                  { n: 'Golpe de gracia', p: '54.8%' },
                ].map((r) => (
                  <div
                    key={r.n}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-white/[0.04] flex items-center justify-center">
                      <div className="w-3 h-3 rounded-full bg-emerald-500/30" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-medium">{r.n}</div>
                    </div>
                    <span className="text-[10px] text-muted-foreground">{r.p}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Secondary Tree */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                Árbol Secundario · Precisión
              </h3>
              <div className="flex items-center gap-3">
                {[
                  { n: 'Presencia del campeón', p: '55.1%' },
                  { n: 'Corte fatal', p: '42.3%' },
                ].map((r) => (
                  <div key={r.n} className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.02]">
                    <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500/30" />
                    </div>
                    <div>
                      <div className="text-[11px] font-medium">{r.n}</div>
                      <div className="text-[10px] text-muted-foreground">{r.p}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Stat Shards */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                Fragmentos de estadísticas
              </h3>
              <div className="flex items-center gap-2">
                {[
                  { l: '+9 Fuerza adaptativa', c: 'text-red-400' },
                  { l: '+6 Resistencia mágica', c: 'text-cyan-400' },
                  { l: '+6 Velocidad', c: 'text-yellow-400' },
                ].map((s) => (
                  <span
                    key={s.l}
                    className={`text-[10px] font-medium px-2 py-1 rounded bg-white/[0.04] ${s.c}`}
                  >
                    {s.l}
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </FadeIn>
    </>
  )
}

export function LoLCountersSection() {
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
        <p className="text-sm text-muted-foreground mb-6">
          Matchups favorables y desfavorables para cada campeón
        </p>
      </FadeIn>
      <FadeIn delay={0.1}>
        <div className="space-y-2 max-w-4xl">
          {matchups.map((m) => {
            const rc = ROLE_COLORS[m.role as LoLRole]
            return (
              <Card key={m.champ1 + m.champ2} className="border-white/[0.06] py-0">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div
                        className={`w-10 h-10 rounded-full ${rc.bg} border ${rc.border} flex items-center justify-center text-xs font-bold ${rc.text}`}
                      >
                        {m.champ1.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-semibold">{m.champ1}</div>
                        <span
                          className={`text-[10px] px-1.5 py-px rounded ${rc.bg} ${rc.text} border ${rc.border}`}
                        >
                          {m.role}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-emerald-400">{m.wr1}% WR</span>
                    </div>
                    <div className="px-4 text-center">
                      <div className="text-[10px] text-muted-foreground mb-1">VS</div>
                      <div className="text-xs font-bold text-foreground">
                        {m.wr1 - m.wr2 > 0 ? '+' : ''}
                        {(m.wr1 - m.wr2).toFixed(1)}%
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-1 justify-end">
                      <span className="text-xs font-bold text-rose-400">{m.wr2}% WR</span>
                      <div>
                        <div className="text-sm font-semibold text-right">{m.champ2}</div>
                      </div>
                      <div
                        className={`w-10 h-10 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-xs font-bold text-muted-foreground`}
                      >
                        {m.champ2.charAt(0)}
                      </div>
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

export function LoLProBuildsSection() {
  return (
    <>
      <FadeIn>
        <h1 className="text-2xl font-bold tracking-tight mb-1">Pro Builds</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Builds utilizadas por jugadores profesionales
        </p>
      </FadeIn>
      <FadeIn delay={0.1}>
        <div className="space-y-2 max-w-4xl">
          {LOL_PRO_BUILDS.map((pb) => {
            const rc = ROLE_COLORS[pb.role as LoLRole]
            return (
              <Card
                key={pb.player}
                className="border-white/[0.06] py-0 group hover:border-white/[0.1] transition-colors"
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl ${rc.bg} border ${rc.border} flex items-center justify-center text-base font-bold ${rc.text} shrink-0`}
                    >
                      {pb.champion.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold">{pb.player}</span>
                        <span className="text-[10px] text-muted-foreground">{pb.team}</span>
                        <span
                          className={`text-[10px] px-1.5 py-px rounded ${rc.bg} ${rc.text} border ${rc.border}`}
                        >
                          {pb.role}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {pb.champion} · {pb.games} partidas
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm font-bold text-emerald-400">{pb.winrate}%</div>
                      <div className="text-[10px] text-muted-foreground">Win Rate</div>
                    </div>
                    <div className="hidden lg:flex items-center gap-1">
                      {pb.items.slice(0, 3).map((_item, i) => (
                        <div
                          key={i}
                          className="w-8 h-8 rounded bg-white/[0.04] border border-white/[0.06] flex items-center justify-center -ml-1 first:ml-0"
                        >
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

export function LoLTierListSection() {
  const lolGame = GAMES.find((g) => g.id === 'lol')!
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
            <div>Tier</div>
            <div>Campeón</div>
            <div>Win Rate</div>
            <div>Pick Rate</div>
            <div>Rol</div>
          </div>
          {lolGame.tierList!.map((tier) => (
            <div key={tier.tier} className="border-b border-border/40 last:border-b-0">
              <div className="hidden sm:contents">
                {tier.champions.map((champ, i) => (
                  <div
                    key={champ.name}
                    className="grid grid-cols-[60px_1fr_100px_100px_80px] gap-3 px-6 py-3 items-center hover:bg-white/[0.02] transition-colors"
                  >
                    {i === 0 && (
                      <div className="row-span-4 flex items-center">
                        <Badge className={`${tier.color} border font-bold text-sm px-3`}>
                          {tier.tier}
                        </Badge>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold">
                        {champ.name.charAt(0)}
                      </div>
                      <span className="font-medium text-sm">{champ.name}</span>
                    </div>
                    <div
                      className={`text-sm font-medium ${parseFloat(champ.winrate) >= 51 ? 'text-emerald-400' : parseFloat(champ.winrate) >= 50 ? 'text-foreground' : 'text-rose-400'}`}
                    >
                      {champ.winrate}
                    </div>
                    <div className="text-sm text-muted-foreground">{champ.pick}</div>
                    <Badge variant="secondary" className="text-[10px] px-2 py-0.5 w-fit">
                      {champ.role}
                    </Badge>
                  </div>
                ))}
              </div>
              <div className="sm:hidden px-4 pt-3">
                <Badge className={`${tier.color} border font-bold text-sm px-3`}>{tier.tier}</Badge>
              </div>
              <div className="sm:hidden grid grid-cols-2 gap-2 px-4 pb-3">
                {tier.champions.map((champ) => (
                  <div
                    key={champ.name}
                    className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.02]"
                  >
                    <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold shrink-0">
                      {champ.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-medium truncate">{champ.name}</div>
                      <div className="text-[10px] text-muted-foreground">
                        {champ.winrate} · {champ.role}
                      </div>
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

export function LoLLeaderboardsSection() {
  const leaders = [
    {
      rank: 1,
      name: 'KR Player 1',
      region: 'KR',
      lp: 1247,
      winrate: 68.2,
      games: 342,
      role: 'Mid',
    },
    {
      rank: 2,
      name: 'EUW Challenger',
      region: 'EUW',
      lp: 1198,
      winrate: 65.8,
      games: 412,
      role: 'Jungle',
    },
    { rank: 3, name: 'NA Ace', region: 'NA', lp: 1156, winrate: 63.4, games: 289, role: 'ADC' },
    { rank: 4, name: 'CN Pro', region: 'CN', lp: 1123, winrate: 61.9, games: 367, role: 'Top' },
    {
      rank: 5,
      name: 'BR Star',
      region: 'BR',
      lp: 1089,
      winrate: 60.1,
      games: 445,
      role: 'Support',
    },
    { rank: 6, name: 'LATAM God', region: 'LAS', lp: 1045, winrate: 59.3, games: 398, role: 'Mid' },
    {
      rank: 7,
      name: 'OCE Top',
      region: 'OCE',
      lp: 1012,
      winrate: 58.7,
      games: 321,
      role: 'Jungle',
    },
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
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider w-12">
                    #
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Jugador
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">
                    Región
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    LP
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">
                    Win Rate
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                    Partidas
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                    Rol
                  </th>
                </tr>
              </thead>
              <tbody>
                {leaders.map((l) => (
                  <tr
                    key={l.rank}
                    className="border-b border-border/30 hover:bg-white/[0.02] transition-colors"
                  >
                    <td
                      className={`px-4 py-3 font-bold ${l.rank <= 3 ? 'text-yellow-400' : 'text-muted-foreground'}`}
                    >
                      {l.rank}
                    </td>
                    <td className="px-4 py-3 font-medium">{l.name}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0.5">
                        {l.region}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 font-bold text-emerald-400">{l.lp}</td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className={l.winrate >= 60 ? 'text-emerald-400' : 'text-foreground'}>
                        {l.winrate}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                      {l.games}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5">
                        {l.role}
                      </Badge>
                    </td>
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

export function LoLLiveGameSection() {
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
              Vincula tu cuenta de Riot Games para analizar partidas en vivo con win probability y
              recomendaciones de builds en tiempo real.
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

'use client'

import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  LOL_ROLES,
  type LoLChampion,
  type LoLRole,
  ROLE_COLORS,
  TIER_STYLES,
} from '@/features/lol/constants'

export function WinRateBar({
  value,
  max = 55,
  min = 45,
}: {
  value: number
  max?: number
  min?: number
}) {
  const pct = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100))
  const color =
    value >= 52
      ? 'bg-emerald-500'
      : value >= 50
        ? 'bg-emerald-400/70'
        : value >= 49
          ? 'bg-amber-400/60'
          : 'bg-rose-400/70'
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

export function ChampionCard({
  champ,
  compact = false,
  index = 0,
}: {
  champ: LoLChampion
  compact?: boolean
  index?: number
}) {
  const rc = ROLE_COLORS[champ.role]
  const ts = TIER_STYLES[champ.tier]
  const wrColor =
    champ.winrate >= 51
      ? 'text-emerald-400'
      : champ.winrate >= 50
        ? 'text-foreground'
        : 'text-rose-400'
  const TrendIcon =
    champ.trend === 'up' ? ChevronRight : champ.trend === 'down' ? ChevronLeft : null
  const trendColor =
    champ.trend === 'up'
      ? 'text-emerald-400'
      : champ.trend === 'down'
        ? 'text-rose-400'
        : 'text-muted-foreground'
  const tierDotColor =
    champ.tier === 'S'
      ? 'bg-yellow-400'
      : champ.tier === 'A'
        ? 'bg-emerald-400'
        : champ.tier === 'B'
          ? 'bg-blue-400'
          : 'bg-violet-400'
  const isSTier = champ.tier === 'S'

  if (compact) {
    return (
      <motion.div
        className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/[0.03] transition-all cursor-pointer border border-transparent hover:border-white/[0.04] ${isSTier ? 'tier-s-glow' : ''}`}
        whileHover={{ x: 4 }}
        transition={{ duration: 0.2 }}
      >
        <span className="text-[11px] font-bold text-muted-foreground/50 w-5 text-right shrink-0">
          {index + 1}
        </span>
        <div
          className={`w-9 h-9 rounded-lg ${rc.bg} border ${rc.border} flex items-center justify-center text-sm font-bold ${rc.text} shrink-0 group-hover:scale-110 transition-transform duration-300`}
        >
          {champ.name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold truncate group-hover:text-emerald-300 transition-colors">
              {champ.name}
            </span>
            <div className="flex items-center gap-1">
              <span
                className={`w-1.5 h-1.5 rounded-full ${tierDotColor} ${isSTier ? 'pulse-live' : ''}`}
              />
              <span className={`text-[10px] font-bold ${ts.text}`}>{champ.tier}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-0.5">
            <span className={`text-xs font-semibold ${wrColor}`}>{champ.winrate}%</span>
            <WinRateBar value={champ.winrate} />
          </div>
        </div>
        <div className="text-right shrink-0 flex items-center gap-2">
          <span className="text-[11px] text-muted-foreground hidden sm:inline">
            {champ.pickrate}% PR
          </span>
          {TrendIcon && (
            <span className={`text-[11px] font-medium ${trendColor} flex items-center gap-0.5`}>
              <TrendIcon className="w-3 h-3" />
              {champ.trendChange > 0 ? '+' : ''}
              {champ.trendChange}%
            </span>
          )}
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
      <div className="relative shrink-0">
        <div
          className={`w-8 h-8 rounded-full ${rc.bg} border ${rc.border} flex items-center justify-center text-xs font-bold ${rc.text} group-hover:scale-110 transition-transform duration-300`}
        >
          {champ.name.charAt(0)}
        </div>
        <span
          className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ${tierDotColor} border-2 border-[#09090b] flex items-center justify-center ${isSTier ? 'pulse-live' : ''}`}
        >
          <span className="text-[6px] font-black text-black leading-none">{champ.tier}</span>
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold truncate group-hover:text-emerald-300 transition-colors duration-200">
            {champ.name}
          </span>
          <span
            className={`text-[9px] px-1 py-px rounded font-medium ${rc.bg} ${rc.text} border ${rc.border} leading-none`}
          >
            {champ.role}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className={`text-[11px] font-bold ${wrColor}`}>{champ.winrate}%</span>
          <WinRateBar value={champ.winrate} />
        </div>
      </div>
      <div className="text-right shrink-0 flex items-center gap-2">
        <span className="text-[10px] text-muted-foreground hidden sm:inline">
          {champ.pickrate}% PR
        </span>
        <span className="text-[10px] text-muted-foreground/60 hidden md:inline">
          {champ.banrate}% BR
        </span>
        {TrendIcon && (
          <span className={`text-[10px] font-semibold ${trendColor} flex items-center gap-0.5`}>
            <TrendIcon className="w-2.5 h-2.5" />
            {champ.trendChange > 0 ? '+' : ''}
            {champ.trendChange}%
          </span>
        )}
      </div>
    </motion.div>
  )
}

const ROLE_DOT_COLORS: Record<string, string> = {
  Top: 'bg-orange-400',
  Jungle: 'bg-green-400',
  Mid: 'bg-cyan-400',
  ADC: 'bg-red-400',
  Support: 'bg-yellow-400',
}

export function RoleFilterTabs({
  selected,
  onChange,
}: {
  selected: LoLRole | 'All'
  onChange: (r: LoLRole | 'All') => void
}) {
  return (
    <div className="flex items-center gap-0.5">
      {LOL_ROLES.map((role) => {
        const isActive = selected === role.id
        const isAll = role.id === 'All'
        return (
          <button
            key={role.id}
            type="button"
            onClick={() => onChange(role.id)}
            className={`relative flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap transition-all duration-150 cursor-pointer shrink-0 ${
              isActive
                ? 'bg-white/[0.08] text-foreground'
                : 'text-muted-foreground/60 hover:text-foreground hover:bg-white/[0.04]'
            }`}
          >
            {!isAll && (
              <span
                className={`w-1.5 h-1.5 rounded-full ${ROLE_DOT_COLORS[role.id]} ${isActive ? 'shadow-sm' : 'opacity-40'}`}
              />
            )}
            {role.label}
            {isActive && (
              <motion.div
                layoutId="lol-role-tab"
                className="absolute bottom-0 left-1 right-1 h-0.5 bg-emerald-500 rounded-full"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
          </button>
        )
      })}
    </div>
  )
}

export function DashboardLoadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-24 rounded-xl bg-white/[0.03] border border-white/[0.04]" />
      <div className="grid grid-cols-4 gap-2">
        {[...Array(4)].map((_, i) => (
          <div
            key={`stat-${i}`}
            className="h-14 rounded-lg bg-white/[0.03] border border-white/[0.04]"
          />
        ))}
      </div>
      <div className="h-12 rounded-lg bg-white/[0.03] border border-white/[0.04]" />
      <div className="rounded-xl border border-white/[0.04] bg-white/[0.01] divide-y divide-white/[0.02]">
        {[...Array(8)].map((_, i) => (
          <div key={`row-${i}`} className="flex items-center gap-3 px-4 py-3">
            <div className="w-8 h-8 rounded-full bg-white/[0.04]" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 w-24 rounded bg-white/[0.04]" />
              <div className="h-2 w-16 rounded bg-white/[0.03]" />
            </div>
            <div className="h-3 w-10 rounded bg-white/[0.04]" />
          </div>
        ))}
      </div>
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

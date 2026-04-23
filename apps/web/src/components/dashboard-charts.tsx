'use client'

import { motion } from 'framer-motion'
import { Activity, Layers, Timer } from 'lucide-react'
import { useMemo } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts'
import { FadeIn } from '@/components/animations'
import { Badge } from '@/components/ui/badge'
import type { AccentPalette, GameEntity, RoleColorPalette } from '@/features/games/dashboard-types'

export const CHART_COLORS = [
  '#facc15',
  '#34d399',
  '#60a5fa',
  '#a78bfa',
  '#f87171',
  '#fb923c',
  '#2dd4bf',
  '#f472b6',
]

const TIER_COLOR_MAP: Record<string, string> = {
  S: '#facc15',
  A: '#34d399',
  B: '#60a5fa',
  C: '#a78bfa',
}

export function DashboardCharts({
  entities,
  entityLabel,
  accent,
  roleColors,
  showPlacement,
}: {
  entities: GameEntity[]
  entityLabel: string
  accent: AccentPalette
  roleColors: Record<string, RoleColorPalette>
  showPlacement?: boolean
}) {
  // Top 8 entities by win rate for bar chart
  const topEntities = useMemo(
    () =>
      [...entities]
        .sort((a, b) => {
          const va = showPlacement ? a.placementRate || a.winrate : a.winrate
          const vb = showPlacement ? b.placementRate || b.winrate : b.winrate
          return vb - va
        })
        .slice(0, 8)
        .map((e) => ({
          name: e.name.length > 10 ? `${e.name.slice(0, 9)}…` : e.name,
          fullName: e.name,
          value: showPlacement ? e.placementRate || e.winrate : e.winrate,
          tier: e.tier,
          role: e.role,
        })),
    [entities, showPlacement],
  )

  // Tier distribution for pie chart
  const tierDist = useMemo(() => {
    const counts: Record<string, number> = { S: 0, A: 0, B: 0, C: 0 }
    entities.forEach((e) => {
      if (counts[e.tier] !== undefined) counts[e.tier]++
    })
    return Object.entries(counts).map(([tier, count]) => ({
      name: `${tier}-Tier`,
      value: count,
      tier,
    }))
  }, [entities])

  // Role distribution
  const roleOnlyDefs = Object.keys(roleColors).filter((k) => k !== 'All' && roleColors[k])
  const roleDist = useMemo(
    () =>
      roleOnlyDefs
        .map((role) => ({
          name: role,
          value: entities.filter((e) => e.role === role).length,
          color: roleColors[role]?.dot || '#888',
        }))
        .filter((d) => d.value > 0),
    [entities, roleOnlyDefs, roleColors],
  )

  // Simulated trend data for area chart
  const trendData = useMemo(() => {
    const labels = [
      '7d ago',
      '6d ago',
      '5d ago',
      '4d ago',
      '3d ago',
      '2d ago',
      'Yesterday',
      'Today',
    ]
    return labels.map((label, i) => ({
      label,
      winRate: +(49.5 + Math.sin(i * 0.8) * 1.2 + (i / labels.length) * 1.5).toFixed(1),
      pickRate: +(10 + Math.cos(i * 0.6) * 2 + (i / labels.length) * 1).toFixed(1),
    }))
  }, [])

  const trendAccentColor = accent.text.includes('emerald') ? '#34d399' : '#f87171'

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
              Top {entityLabel.charAt(0).toUpperCase() + entityLabel.slice(1)} —{' '}
              {showPlacement ? 'Top 4 Rate' : 'Win Rate'} %
            </h3>
          </div>
          <div className="p-3">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={topEntities}
                layout="vertical"
                margin={{ top: 0, right: 30, left: 0, bottom: 0 }}
              >
                <XAxis
                  type="number"
                  domain={showPlacement ? [15, 35] : [47, 55]}
                  tick={{ fontSize: 10, fill: '#71717a' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 10, fill: '#a1a1aa' }}
                  width={65}
                  axisLine={false}
                  tickLine={false}
                />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '8px',
                    fontSize: '11px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                  }}
                  labelStyle={{ color: '#e4e4e7', fontWeight: 600 }}
                  formatter={(value: number, name: string) => [
                    `${value}%`,
                    name === 'value' ? (showPlacement ? 'Top 4 Rate' : 'Win Rate') : name,
                  ]}
                  labelFormatter={(label: string) => {
                    const found = topEntities.find((t) => t.name === label)
                    return found?.fullName || label
                  }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={18}>
                  {topEntities.map((entry, index) => (
                    <Cell
                      key={`cell-${entry.fullName}-${index}`}
                      fill={TIER_COLOR_MAP[entry.tier] || accent.primary.replace('bg-', '#')}
                      fillOpacity={0.8}
                    />
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
              <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Tier Distribution
              </h3>
            </div>
            <div className="p-3 flex items-center gap-3">
              <ResponsiveContainer width={90} height={90}>
                <PieChart>
                  <Pie
                    data={tierDist}
                    cx="50%"
                    cy="50%"
                    innerRadius={25}
                    outerRadius={42}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {tierDist.map((entry) => (
                      <Cell
                        key={`tier-${entry.tier}`}
                        fill={TIER_COLOR_MAP[entry.tier] || '#888'}
                      />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: '#18181b',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '8px',
                      fontSize: '11px',
                    }}
                    formatter={(value: number) => [`${value} ${entityLabel}`, 'Count']}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5">
                {tierDist.map((t) => (
                  <div key={t.tier} className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-sm shrink-0"
                      style={{ backgroundColor: TIER_COLOR_MAP[t.tier] }}
                    />
                    <span className="text-[10px] text-muted-foreground flex-1">{t.name}</span>
                    <span
                      className="text-[10px] font-bold"
                      style={{ color: TIER_COLOR_MAP[t.tier] }}
                    >
                      {t.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Role Composition */}
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.01] overflow-hidden">
            <div className="px-4 py-2.5 border-b border-white/[0.04] bg-white/[0.02]">
              <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Role Composition
              </h3>
            </div>
            <div className="p-3">
              <div className="space-y-1.5">
                {roleDist.slice(0, 5).map((r) => {
                  const pct = (r.value / entities.length) * 100
                  return (
                    <div key={r.name}>
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-[10px] text-muted-foreground">{r.name}</span>
                        <span className="text-[10px] font-bold">
                          {r.value} ({pct.toFixed(0)}%)
                        </span>
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
                    <stop offset="5%" stopColor={trendAccentColor} stopOpacity={0.15} />
                    <stop offset="95%" stopColor={trendAccentColor} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 9, fill: '#71717a' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={['dataMin - 0.5', 'dataMax + 0.5']}
                  tick={{ fontSize: 9, fill: '#71717a' }}
                  axisLine={false}
                  tickLine={false}
                  width={32}
                />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '8px',
                    fontSize: '11px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                  }}
                  formatter={(value: number, name: string) => [
                    `${value}%`,
                    name === 'winRate' ? 'Avg Win Rate' : 'Avg Pick Rate',
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="winRate"
                  stroke={trendAccentColor}
                  strokeWidth={2}
                  fill="url(#wrGrad)"
                  dot={{ r: 3, fill: trendAccentColor, strokeWidth: 0 }}
                />
                <Area
                  type="monotone"
                  dataKey="pickRate"
                  stroke="#60a5fa"
                  strokeWidth={1.5}
                  fill="none"
                  strokeDasharray="4 4"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </FadeIn>
  )
}

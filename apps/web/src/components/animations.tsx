'use client'

import { motion, useInView, type Variants } from 'framer-motion'
import { Loader2, type LucideIcon, Wifi } from 'lucide-react'
import { type ReactNode, useCallback, useRef, useSyncExternalStore } from 'react'
import { useAnimatedCounter, useCardTilt } from '@/hooks/useAnimatedCounter'
import { formatLastUpdated } from '@/hooks/useGameStats'

export function useIsDesktop() {
  const subscribe = useCallback((cb: () => void) => {
    const mql = window.matchMedia('(min-width: 1024px)')
    const handler = () => cb()
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [])
  const getSnapshot = useCallback(() => window.matchMedia('(min-width: 1024px)').matches, [])
  const getServerSnapshot = useCallback(() => false, [])
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

export function FadeIn({
  children,
  delay = 0,
  className = '',
  direction = 'up',
}: {
  children: ReactNode
  delay?: number
  className?: string
  direction?: 'up' | 'down' | 'left' | 'right' | 'none'
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-40px' })
  const directionMap = {
    up: { y: 24 },
    down: { y: -24 },
    left: { x: 24 },
    right: { x: -24 },
    none: {},
  }
  const initial = { opacity: 0, ...directionMap[direction] }
  return (
    <motion.div
      ref={ref}
      initial={initial}
      animate={isInView ? { opacity: 1, x: 0, y: 0 } : initial}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function StaggerContainer({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-40px' })
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 16, scale: 0.98 },
        visible: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export const pageVariants: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -4, transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] } },
}

export function AnimatedStat({
  value,
  label,
  icon: Icon,
  delay = 0,
}: {
  value: string
  label: string
  icon: LucideIcon
  delay?: number
}) {
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
        <div className="text-xl sm:text-2xl font-bold text-foreground group-hover:text-emerald-300 transition-colors duration-300 tabular-nums">
          {display}
        </div>
      </div>
      <div className="text-[11px] sm:text-xs text-muted-foreground">{label}</div>
    </div>
  )
}

export function TiltCard({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  const tiltRef = useCardTilt({ maxTilt: 5, scale: 1.015 })
  return (
    <div ref={tiltRef} className={`card-3d ${className}`}>
      {children}
    </div>
  )
}

export function LiveIndicator({
  lastUpdated,
  source,
  isLoading,
  onRefresh,
}: {
  lastUpdated: number
  source?: string
  isLoading?: boolean
  onRefresh?: () => void
}) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
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
        <span className="text-[8px] text-muted-foreground/30 hidden sm:inline truncate max-w-[120px]">
          {source}
        </span>
      )}
    </div>
  )
}

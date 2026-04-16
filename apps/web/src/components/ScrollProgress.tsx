'use client'

import { useScrollProgress } from '@/hooks/useAnimatedCounter'

export function ScrollProgress() {
  const progress = useScrollProgress()

  if (progress < 0.01) return null

  return (
    <div
      className="scroll-progress"
      style={{ width: `${progress * 100}%` }}
    />
  )
}

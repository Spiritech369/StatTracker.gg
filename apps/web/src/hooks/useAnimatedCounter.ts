'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'

/**
 * Hook that animates a number from 0 to the target value when triggered.
 * Supports decimal precision, duration, and easing.
 */
export function useAnimatedCounter(
  target: number,
  options: {
    duration?: number
    decimals?: number
    enabled?: boolean
    delay?: number
    prefix?: string
    suffix?: string
  } = {}
) {
  const { duration = 1500, decimals = 0, enabled = true, delay = 0, prefix = '', suffix = '' } = options
  const initialDisplay = useMemo(() => prefix + '0' + suffix, [prefix, suffix])
  const [display, setDisplay] = useState(initialDisplay)
  const hasAnimatedRef = useRef(false)
  const targetRef = useRef(target)
  const ref = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number>(0)

  const animate = useCallback(() => {
    if (!enabled) return

    // Reset if target changed
    const currentTarget = targetRef.current
    setDisplay(initialDisplay)
    hasAnimatedRef.current = false

    const startTime = performance.now() + delay

    const step = (now: number) => {
      const elapsed = now - startTime
      if (elapsed < 0) {
        rafRef.current = requestAnimationFrame(step)
        return
      }

      const progress = Math.min(elapsed / duration, 1)
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = currentTarget * eased

      setDisplay(
        prefix +
        current.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',') +
        suffix
      )

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step)
      } else {
        hasAnimatedRef.current = true
      }
    }

    rafRef.current = requestAnimationFrame(step)
  }, [duration, decimals, enabled, delay, prefix, suffix, initialDisplay])

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && enabled) {
          animate()
        }
      },
      { threshold: 0.3 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      observer.disconnect()
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [animate, enabled])

  return { display, ref }
}

/**
 * Hook for mouse-follow glow effect on a container.
 * Returns ref to attach to the container element.
 */
export function useMouseGlow() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const handleMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      el.style.setProperty('--glow-x', `${x}px`)
      el.style.setProperty('--glow-y', `${y}px`)
    }

    el.addEventListener('mousemove', handleMouseMove, { passive: true })
    return () => el.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return ref
}

/**
 * Hook for 3D card tilt effect on hover.
 * Returns ref and event handlers.
 */
export function useCardTilt(options: { maxTilt?: number; scale?: number } = {}) {
  const { maxTilt = 6, scale = 1.02 } = options
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const handleMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      const rotateX = ((e.clientY - centerY) / (rect.height / 2)) * -maxTilt
      const rotateY = ((e.clientX - centerX) / (rect.width / 2)) * maxTilt

      el.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${scale}, ${scale}, ${scale})`
    }

    const handleMouseLeave = () => {
      el.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)'
    }

    el.addEventListener('mousemove', handleMouseMove, { passive: true })
    el.addEventListener('mouseleave', handleMouseLeave, { passive: true })
    return () => {
      el.removeEventListener('mousemove', handleMouseMove)
      el.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [maxTilt, scale])

  return ref
}

/**
 * Hook for scroll progress (0 to 1).
 */
export function useScrollProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      setProgress(docHeight > 0 ? scrollTop / docHeight : 0)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return progress
}

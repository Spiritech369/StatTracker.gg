'use client'

import { useEffect, useRef, useMemo } from 'react'

interface Particle {
  x: number
  y: number
  size: number
  speedX: number
  speedY: number
  opacity: number
  color: string
  pulse: number
  pulseSpeed: number
}

interface FloatingParticlesProps {
  count?: number
  colors?: string[]
  className?: string
}

export function FloatingParticles({ count = 30, colors, className = '' }: FloatingParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const animRef = useRef<number>(0)

  const defaultColors = useMemo(() => [
    'rgba(16, 185, 129, 0.15)',
    'rgba(52, 211, 153, 0.1)',
    'rgba(245, 158, 11, 0.08)',
    'rgba(139, 92, 246, 0.08)',
    'rgba(255, 255, 255, 0.05)',
  ], [])

  const particleColors = colors || defaultColors

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio
      canvas.height = canvas.offsetHeight * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }
    resize()
    window.addEventListener('resize', resize)

    // Initialize particles
    particlesRef.current = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.offsetWidth,
      y: Math.random() * canvas.offsetHeight,
      size: Math.random() * 2 + 0.5,
      speedX: (Math.random() - 0.5) * 0.3,
      speedY: (Math.random() - 0.5) * 0.3 - 0.1,
      opacity: Math.random() * 0.5 + 0.1,
      color: particleColors[Math.floor(Math.random() * particleColors.length)],
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: Math.random() * 0.02 + 0.005,
    }))

    const w = () => canvas.offsetWidth
    const h = () => canvas.offsetHeight

    const animate = () => {
      ctx.clearRect(0, 0, w(), h())

      particlesRef.current.forEach(p => {
        p.x += p.speedX
        p.y += p.speedY
        p.pulse += p.pulseSpeed

        const currentOpacity = p.opacity * (0.5 + 0.5 * Math.sin(p.pulse))
        const currentSize = p.size * (0.8 + 0.2 * Math.sin(p.pulse))

        // Wrap around
        if (p.x < -10) p.x = w() + 10
        if (p.x > w() + 10) p.x = -10
        if (p.y < -10) p.y = h() + 10
        if (p.y > h() + 10) p.y = -10

        // Draw particle with glow
        ctx.beginPath()
        ctx.arc(p.x, p.y, currentSize, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.globalAlpha = currentOpacity
        ctx.fill()

        // Outer glow
        if (currentSize > 1) {
          ctx.beginPath()
          ctx.arc(p.x, p.y, currentSize * 3, 0, Math.PI * 2)
          const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, currentSize * 3)
          gradient.addColorStop(0, p.color)
          gradient.addColorStop(1, 'transparent')
          ctx.fillStyle = gradient
          ctx.globalAlpha = currentOpacity * 0.3
          ctx.fill()
        }
      })

      // Draw connections between nearby particles
      ctx.globalAlpha = 1
      const particles = particlesRef.current
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 120) {
            const lineOpacity = (1 - dist / 120) * 0.06
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = `rgba(16, 185, 129, ${lineOpacity})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }

      animRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animRef.current)
    }
  }, [count, particleColors])

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      style={{ opacity: 0.7 }}
    />
  )
}

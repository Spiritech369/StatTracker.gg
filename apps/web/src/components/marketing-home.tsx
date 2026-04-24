'use client'

import { motion } from 'framer-motion'
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Brain,
  Check,
  Eye,
  Flame,
  Search,
  Star,
  Target,
  Trophy,
  Users,
  Zap,
} from 'lucide-react'
import {
  AnimatedStat,
  FadeIn,
  pageVariants,
  StaggerContainer,
  StaggerItem,
  TiltCard,
} from '@/components/animations'
import { FloatingParticles } from '@/components/FloatingParticles'
import { Footer } from '@/components/layout'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ACCENT_MAP } from '@/features/games/dashboard-types'
import { GAMES } from '@/features/games/data'
import type { GameId } from '@/features/games/types'

/* ────────────────────────────────────
   FEATURES & PRICING
   ──────────────────────────────────── */

export const FEATURES_LIST = [
  {
    icon: BarChart3,
    title: 'Builds Optimizados',
    description:
      'Calculados con datos de millones de partidas reales, filtrados por parche, rango y rol.',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
  },
  {
    icon: Target,
    title: 'Counters Inteligentes',
    description: 'Descubre quién te countertea y cómo adaptar tu estrategia en tiempo real.',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
  },
  {
    icon: Eye,
    title: 'Live Game Tracking',
    description: 'Analiza la partida en vivo con win probability y recomendaciones contextuales.',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10',
  },
  {
    icon: Brain,
    title: 'IA Coach Personal',
    description: 'Diagnósticos post-partida y plan de mejora adaptado a tu estilo de juego.',
    color: 'text-violet-400',
    bgColor: 'bg-violet-500/10',
  },
  {
    icon: Trophy,
    title: 'Leaderboards Globales',
    description: 'Rankings por región, champion y rol. Comparate con los mejores del mundo.',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/10',
  },
  {
    icon: Users,
    title: 'Scouting de Equipos',
    description: 'Analiza a tus oponentes antes de la partida. Win rates y tendencias.',
    color: 'text-rose-400',
    bgColor: 'bg-rose-400/10',
  },
]

export const PRICING = [
  {
    name: 'Free',
    price: '$0',
    period: 'para siempre',
    description: 'Perfecto para empezar a mejorar',
    features: [
      'Builds y runes básicos',
      'Tier list general',
      '5 lookups de perfil/día',
      'Counter picks básicos',
      'Stats del parche actual',
    ],
    cta: 'Empezar gratis',
    variant: 'outline' as const,
    popular: false,
  },
  {
    name: 'Plus',
    price: '$7.99',
    period: '/mes',
    description: 'Para jugadores serios',
    features: [
      'Todo lo de Free',
      'Builds avanzados por rango y rol',
      'Live game tracking',
      'IA Coach personal',
      'Lookups ilimitados',
      'Leaderboards avanzados',
      'Scouting de oponentes',
      'Sin anuncios',
    ],
    cta: 'Probar 7 días gratis',
    variant: 'default' as const,
    popular: true,
  },
  {
    name: 'Team',
    price: '$24.99',
    period: '/mes',
    description: 'Para equipos competitivos',
    features: [
      'Todo lo de Plus para 5 miembros',
      'Draft analysis de equipo',
      'Scouting avanzado',
      'Reportes post-match',
      'Discord bot integrado',
      'Soporte prioritario',
      'API access',
      'Custom dashboards',
    ],
    cta: 'Contactar ventas',
    variant: 'outline' as const,
    popular: false,
  },
]

export const NAV_LINKS = [
  { label: 'Tier List', href: '#tier-list' },
  { label: 'Características', href: '#features' },
  { label: 'Precios', href: '#pricing' },
]

/* ────────────────────────────────────
   HOME PAGE (Game Selection)
   ──────────────────────────────────── */

export function HomePage({ onSelectGame }: { onSelectGame: (id: GameId) => void }) {
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
                Datos competitivos, builds optimizados y coaching con IA para los juegos más
                populares.
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
                      <div
                        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                        style={{ boxShadow: `inset 0 0 30px rgba(16, 185, 129, 0.05)` }}
                      />

                      {/* Badge */}
                      {game.badge && (
                        <motion.div
                          className="absolute top-2.5 left-2.5 z-10"
                          initial={{ x: -10, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ duration: 0.4, delay: 0.2 }}
                        >
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${game.badge.color} shadow-lg`}
                          >
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
            <FadeIn
              delay={0.4}
              className="mt-12 flex flex-wrap items-center justify-center gap-6 sm:gap-10"
            >
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
                <div className="text-[11px] sm:text-xs text-muted-foreground">
                  Tiempo de respuesta
                </div>
              </div>
            </FadeIn>

            {/* Cmd+K Hint */}
            <FadeIn delay={0.5} className="mt-6">
              <button
                onClick={() =>
                  window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))
                }
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] text-xs text-muted-foreground hover:text-foreground transition-all cursor-pointer"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Buscar campeones, agentes, héroes...</span>
                <kbd className="px-1.5 py-0.5 rounded border border-white/[0.08] bg-white/[0.04] text-[10px] font-mono">
                  ⌘K
                </kbd>
              </button>
            </FadeIn>
          </div>
        </section>

        {/* Live Meta Pulse — Cross-game overview */}
        <section className="relative py-16 sm:py-20">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/[0.015] to-transparent" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <FadeIn className="text-center mb-10">
              <Badge variant="outline" className="mb-4 hover:bg-emerald-500/5 transition-colors">
                <Activity className="w-3.5 h-3.5 mr-1.5 text-cyan-400" />
                Live Meta Pulse
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
                El meta en <span className="text-gradient-emerald">tiempo real</span>
              </h2>
              <p className="text-muted-foreground max-w-lg mx-auto text-sm">
                Datos actualizados de todos los juegos activos. Haz clic para explorar.
              </p>
            </FadeIn>
            <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {GAMES.filter((g) => !g.isComingSoon).map((game) => {
                const accent = ACCENT_MAP[game.accentColor] || ACCENT_MAP.emerald
                const Icon = game.icon
                const sTierCount =
                  game.tierList?.reduce((sum, t) => sum + t.champions.length, 0) || 0
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
                            whileHover={{
                              rotate: [0, -10, 10, -5, 5, 0],
                              transition: { duration: 0.5 },
                            }}
                          >
                            <Icon className={`w-4 h-4 ${accent.text}`} />
                          </motion.div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-semibold truncate">{game.shortName}</div>
                            <div className="text-[9px] text-muted-foreground">
                              {game.features[0]?.title || ''}
                            </div>
                          </div>
                          <ArrowRight
                            className={`w-3.5 h-3.5 text-muted-foreground/40 group-hover:${accent.text} group-hover:translate-x-0.5 transition-all`}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {game.features.slice(0, 4).map((feat) => (
                            <div key={feat.title} className="space-y-0.5">
                              <div className={`text-sm font-bold ${accent.text} leading-tight`}>
                                {feat.stat}
                              </div>
                              <div className="text-[9px] text-muted-foreground truncate">
                                {feat.title}
                              </div>
                            </div>
                          ))}
                        </div>
                        {/* Mini activity bar */}
                        <div className="mt-3 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-live" />
                          <span className="text-[9px] text-muted-foreground/60">Live</span>
                          <span className="text-[9px] text-muted-foreground/40 ml-auto">
                            {sTierCount} S-tier
                          </span>
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
              <Badge variant="outline" className="mb-4 hover:bg-emerald-500/5 transition-colors">
                <Zap className="w-3.5 h-3.5 mr-1.5" />
                Características
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
                Todo lo que necesitas para <span className="text-gradient-emerald">mejorar</span>
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Herramientas profesionales construidas sobre datos reales.
              </p>
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
                        <h3 className="text-base font-semibold mb-2 group-hover:text-foreground transition-colors">
                          {feature.title}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {feature.description}
                        </p>
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
              <Badge variant="outline" className="mb-4 hover:bg-amber-500/5 transition-colors">
                <Star className="w-3.5 h-3.5 mr-1.5" />
                Precios
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
                Elige tu nivel de <span className="text-gradient-gold">competitividad</span>
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Desde gratis hasta equipo. Mejora a tu ritmo.
              </p>
            </FadeIn>
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
              {PRICING.map((plan) => (
                <StaggerItem key={plan.name}>
                  <TiltCard>
                    <Card
                      className={`relative h-full hover:border-white/15 transition-all duration-500 py-0 glass ${plan.popular ? 'border-emerald-500/40 tier-s-glow' : ''}`}
                    >
                      {plan.popular && (
                        <motion.div
                          className="absolute -top-3 left-1/2 -translate-x-1/2"
                          initial={{ y: -10, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.3, duration: 0.5, type: 'spring' }}
                        >
                          <Badge className="bg-emerald-500 text-black font-semibold px-3 py-1 shadow-lg shadow-emerald-500/25">
                            Más popular
                          </Badge>
                        </motion.div>
                      )}
                      <CardHeader className="pb-2 pt-6">
                        <CardTitle className="text-lg">{plan.name}</CardTitle>
                        <CardDescription>{plan.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div>
                          <span
                            className={`text-4xl font-bold ${plan.popular ? 'text-gradient-emerald' : ''}`}
                          >
                            {plan.price}
                          </span>
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
                          <Button
                            variant={plan.variant}
                            className={`w-full h-10 transition-all duration-300 ${plan.popular ? 'bg-emerald-500 hover:bg-emerald-400 text-black font-semibold shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30' : 'hover:bg-white/[0.06]'}`}
                          >
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
                      <Button
                        size="lg"
                        className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold h-12 px-8 text-base shadow-lg shadow-emerald-500/25 transition-all hover:shadow-emerald-500/40 glow-emerald"
                      >
                        Crear cuenta gratis <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </motion.div>
                    <p className="text-xs text-muted-foreground mt-4">
                      No requiere tarjeta de crédito. Cancela cuando quieras.
                    </p>
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

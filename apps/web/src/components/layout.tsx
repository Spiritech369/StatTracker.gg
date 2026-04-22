'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { ChevronsLeft, ChevronsRight, Globe, Keyboard, Menu, Search, Trophy, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { NAV_GAMES, SIDEBAR_SECTIONS } from '@/features/games/data'
import type { Game, GameId } from '@/features/games/types'

export function Navbar({
  selectedGameId,
  onLogoClick,
  onSelectGame,
  onToggleMobileSidebar,
  onOpenCommandPalette,
}: {
  selectedGameId: GameId | null
  onLogoClick: () => void
  onSelectGame: (id: GameId) => void
  onToggleMobileSidebar: () => void
  onOpenCommandPalette: () => void
}) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'glass-strong border-b border-white/[0.06] shadow-lg shadow-black/30' : 'bg-transparent'}`}
    >
      <div className="px-2 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-14 gap-2">
          <motion.button
            type="button"
            onClick={onLogoClick}
            className="flex items-center gap-2 shrink-0 group cursor-pointer"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <motion.div
              className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center"
              whileHover={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 0.4 }}
            >
              <Trophy className="w-3.5 h-3.5 text-black" />
            </motion.div>
            <span className="font-bold text-sm tracking-tight hidden sm:inline">
              Tracker<span className="text-emerald-400">Stat</span>
              <span className="text-muted-foreground/60">.gg</span>
            </span>
          </motion.button>

          <div className="flex items-center gap-0.5 overflow-x-auto no-scrollbar flex-1 justify-center mx-2 py-1">
            {NAV_GAMES.map((game) => {
              const isActive = selectedGameId === game.id
              return (
                <button
                  key={game.id}
                  type="button"
                  onClick={() => onSelectGame(game.id)}
                  className={`relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all duration-200 cursor-pointer shrink-0 ${
                    isActive
                      ? 'bg-white/10 text-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full shrink-0 ${game.dotColor} ${isActive ? 'ring-2 ring-offset-1 ring-offset-background' : ''}`}
                  />
                  <span className="hidden xl:inline">{game.name}</span>
                  <span className="xl:hidden">{game.shortName}</span>
                  {game.badge && (
                    <span
                      className={`text-[9px] font-bold px-1 py-px rounded leading-none ${game.badge.bgColor} ${game.badge.color}`}
                    >
                      {game.badge.text}
                    </span>
                  )}
                  {isActive && (
                    <motion.div
                      layoutId="game-indicator"
                      className="absolute bottom-0 left-1 right-1 h-0.5 bg-current rounded-full"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </button>
              )
            })}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {selectedGameId && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 lg:hidden"
                onClick={onToggleMobileSidebar}
              >
                <Menu className="w-4 h-4" />
              </Button>
            )}
            <div className="relative hidden sm:block">
              <button
                type="button"
                onClick={onOpenCommandPalette}
                className="flex items-center gap-2 h-8 px-3 rounded-md bg-secondary border border-border text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-all cursor-pointer"
              >
                <Search className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Buscar...</span>
                <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded border border-border bg-background text-[9px] text-muted-foreground/60">
                  ⌘K
                </kbd>
              </button>
            </div>
            <Button variant="ghost" size="sm" className="hidden md:flex h-8 text-xs">
              Iniciar sesión
            </Button>
            <Button
              size="sm"
              className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold h-8 text-xs px-3"
            >
              Registrarse
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}

const ACCENT_MAP: Record<string, string> = {
  emerald: 'border-l-emerald-500 bg-emerald-500/10 text-emerald-400',
  red: 'border-l-red-500 bg-red-500/10 text-red-400',
  green: 'border-l-green-500 bg-green-500/10 text-green-400',
  amber: 'border-l-amber-500 bg-amber-500/10 text-amber-400',
  violet: 'border-l-violet-500 bg-violet-500/10 text-violet-400',
  purple: 'border-l-purple-500 bg-purple-500/10 text-purple-400',
  orange: 'border-l-orange-500 bg-orange-500/10 text-orange-400',
  rose: 'border-l-rose-500 bg-rose-500/10 text-rose-400',
}

export function GameSidebar({
  game,
  expanded,
  onToggle,
  activeSection,
  onSectionChange,
}: {
  game: Game
  expanded: boolean
  onToggle: () => void
  activeSection: string
  onSectionChange: (id: string) => void
}) {
  const sections = SIDEBAR_SECTIONS[game.id]
  const activeClasses = ACCENT_MAP[game.accentColor] || ACCENT_MAP.emerald

  return (
    <TooltipProvider delayDuration={0}>
      <motion.aside
        className="fixed left-0 top-14 bottom-0 z-40 hidden lg:flex flex-col bg-background/95 backdrop-blur-xl border-r border-border overflow-hidden"
        animate={{ width: expanded ? 200 : 56 }}
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex-1 py-3 overflow-y-auto no-scrollbar">
          {sections.map((section) => {
            const Icon = section.icon
            const isActive = activeSection === section.id

            const btn = (
              <button
                key={section.id}
                type="button"
                onClick={() => onSectionChange(section.id)}
                className={`flex items-center w-full text-sm transition-all duration-150 cursor-pointer border-l-2 ${
                  isActive
                    ? activeClasses
                    : 'border-l-transparent text-muted-foreground hover:text-foreground hover:bg-white/[0.03]'
                } ${expanded ? 'px-3 py-2.5' : 'px-0 justify-center py-2.5'}`}
              >
                <Icon className="w-5 h-5 shrink-0 mx-auto" />
                <AnimatePresence>
                  {expanded && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.15 }}
                      className="ml-3 whitespace-nowrap overflow-hidden font-medium text-xs"
                    >
                      {section.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            )

            if (!expanded) {
              return (
                <Tooltip key={section.id}>
                  <TooltipTrigger asChild>{btn}</TooltipTrigger>
                  <TooltipContent side="right" className="text-xs font-medium">
                    {section.label}
                  </TooltipContent>
                </Tooltip>
              )
            }

            return <div key={section.id}>{btn}</div>
          })}
        </div>

        <button
          type="button"
          onClick={onToggle}
          className="flex items-center justify-center py-3 border-t border-border text-muted-foreground hover:text-foreground hover:bg-white/[0.03] transition-colors cursor-pointer"
        >
          {expanded ? <ChevronsLeft className="w-4 h-4" /> : <ChevronsRight className="w-4 h-4" />}
          <AnimatePresence>
            {expanded && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="ml-2 text-xs font-medium"
              >
                Colapsar
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </motion.aside>
    </TooltipProvider>
  )
}

export function MobileSidebar({
  game,
  open,
  onClose,
  activeSection,
  onSectionChange,
}: {
  game: Game
  open: boolean
  onClose: () => void
  activeSection: string
  onSectionChange: (id: string) => void
}) {
  const sections = SIDEBAR_SECTIONS[game.id]
  const activeClasses = ACCENT_MAP[game.accentColor] || ACCENT_MAP.emerald

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            className="fixed left-0 top-14 bottom-0 z-50 lg:hidden flex flex-col bg-background/95 backdrop-blur-xl border-r border-border w-64"
            initial={{ x: -256 }}
            animate={{ x: 0 }}
            exit={{ x: -256 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="px-4 py-4 border-b border-border flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                <game.icon className={`w-4.5 h-4.5 ${game.iconColor}`} />
              </div>
              <div>
                <div className="text-sm font-semibold">{game.name}</div>
                <div className="text-[10px] text-muted-foreground">{game.tagline}</div>
              </div>
            </div>

            <div className="flex-1 py-2 overflow-y-auto">
              {sections.map((section) => {
                const Icon = section.icon
                const isActive = activeSection === section.id
                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => {
                      onSectionChange(section.id)
                      onClose()
                    }}
                    className={`flex items-center w-full px-4 py-2.5 text-sm transition-all duration-150 cursor-pointer border-l-2 ${
                      isActive
                        ? activeClasses
                        : 'border-l-transparent text-muted-foreground hover:text-foreground hover:bg-white/[0.03]'
                    }`}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    <span className="ml-3 font-medium text-xs">{section.label}</span>
                  </button>
                )
              })}
            </div>

            <div className="p-3 border-t border-border">
              <Button
                variant="ghost"
                className="w-full justify-center text-xs h-8"
                onClick={onClose}
              >
                <X className="w-4 h-4 mr-2" />
                Cerrar menú
              </Button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}

const FOOTER_LINKS = {
  Producto: [
    'League of Legends',
    'TFT',
    'Valorant',
    'Deadlock',
    'Dota 2',
    'Rematch',
    'WoW',
    'Helldivers 2',
    '2XKO',
    'Precios',
  ],
  Recursos: ['Tier Lists', 'Builds', 'Counters', 'Leaderboards', 'Blog', 'API'],
  Empresa: ['Sobre nosotros', 'Carreras', 'Prensa', 'Contacto'],
  Legal: ['Términos de servicio', 'Privacidad', 'Cookies', 'EULA'],
}

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-[#06060a] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center">
                <Trophy className="w-3.5 h-3.5 text-black" />
              </div>
              <span className="font-bold text-sm">
                Tracker<span className="text-emerald-400">Stat</span>
                <span className="text-muted-foreground/60">.gg</span>
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed mb-3">
              Analítica competitiva de nivel profesional para jugadores serios.
            </p>
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/50">
              <Keyboard className="w-3 h-3" />
              <span>
                Press{' '}
                <kbd className="px-1 py-px rounded border border-border bg-secondary text-[9px] font-mono">
                  ⌘K
                </kbd>{' '}
                to search
              </span>
            </div>
          </div>
          {Object.entries(FOOTER_LINKS).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                {category}
              </h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-xs text-muted-foreground/80 hover:text-foreground transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-border/40 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground/60">
            © 2025 TrackerStat.gg. Todos los derechos reservados. No respaldado por Riot Games ni
            ningún otro editor.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="#"
              className="text-muted-foreground/60 hover:text-foreground transition-colors"
            >
              <span className="sr-only">Sitio web</span>
              <Globe className="w-4 h-4" />
            </a>
            <a
              href="#"
              className="text-muted-foreground/60 hover:text-foreground transition-colors"
            >
              <span className="sr-only">Discord</span>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
              </svg>
            </a>
            <a
              href="#"
              className="text-muted-foreground/60 hover:text-foreground transition-colors"
            >
              <span className="sr-only">Twitter</span>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

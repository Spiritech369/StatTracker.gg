# CLAUDE.md

Orientación para Claude Code al trabajar en este repo.

## Proyecto

**StatTracker.gg** — plataforma multi-juego (LoL, TFT, Valorant, Dota2, Deadlock, 2XKO, WoW, Helldivers2, Rematch) que muestra stats, tier lists, builds y perfiles. Actualmente en fase temprana: landing page + mock data. El backend real, DB y auth no existen todavía.

Repo: https://github.com/Spiritech369/StatTracker.gg

## Stack

- **Monorepo**: scripts npm con `--prefix` (no hay Turbo / pnpm workspaces todavía)
- **Web** (`apps/web`): Next.js 16 (App Router, webpack build) + React 19 + Tailwind 4 + shadcn/ui + Radix + Framer Motion + Zustand + TanStack Query + Zod + Prisma (instalado pero sin schema)
- **API / Workers / Desktop** (`apps/api`, `apps/workers`, `apps/desktop`): scaffold vacío — stack aún no decidido
- **Packages**: `ui`, `types`, `database`, `config`, `sdk`, `analytics`, `eslint-config`, `tsconfig` — todos vacíos

## Comandos

```bash
npm run dev              # web en :3000
npm run build:web        # build producción
npm run typecheck        # tsc --noEmit en web
npm run check            # biome lint + format check
npm run check:fix        # auto-fix
```

## Calidad

- **Biome** es la única fuente de verdad para lint + format. No hay ESLint ni Prettier.
- **TypeScript estricto** en web, con `ignoreBuildErrors: false` — si rompe TS, rompe el build.
- **Lefthook** corre `biome check --write` en pre-commit y `typecheck` en pre-push.
- **CI** (`.github/workflows/ci.yml`): typecheck + biome check + build en PRs a main.

## Convenciones

- Estilo JS: comillas simples, sin `;`, trailing commas, 2 espacios, líneas ≤100 (ver `biome.json`).
- Rutas importables con alias `@/*` → `apps/web/src/*`.
- Componentes UI en `apps/web/src/components/ui/` (shadcn). Features en `src/features/<domain>/`.
- Mocks de APIs por juego viven en `src/app/api/stats/<juego>/route.ts`. Mover a backend real cuando exista.

## Lo que NO debes hacer sin preguntar

- Añadir un segundo linter/formatter (ya tenemos Biome).
- Meter Prisma client o queries de DB en `apps/web` — debe vivir en `packages/database` cuando se implemente.
- Implementar features de 9 juegos a la vez; estrategia acordada es **vertical slice primero con LoL**, luego replicar.
- Instalar deps pesadas (gsap, three, socket.io, etc.) — eliminamos una ronda de template cruft y no queremos volver.

## Documentación relevante

- [README.md](README.md) — visión aspiracional (20 pasos). No refleja estado actual.
- [apps/web/SPEC.md](apps/web/SPEC.md) — spec de la web app.
- Roadmap actual se gestiona en conversación; no existe `docs/architecture/` aún.

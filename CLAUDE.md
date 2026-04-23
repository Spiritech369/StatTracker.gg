# CLAUDE.md

Orientación para Claude Code al trabajar en este repo.

## Proyecto

**StatTracker.gg** — plataforma multi-juego (LoL, TFT, Valorant, Dota2, Deadlock, 2XKO, WoW, Helldivers2, Rematch) que muestra stats, tier lists, builds y perfiles.

Repo: https://github.com/Spiritech369/StatTracker.gg
Arquitectura detallada: [docs/architecture/system-design.md](docs/architecture/system-design.md)

## Stack

- **Monorepo**: pnpm workspaces (`pnpm-workspace.yaml`). Lockfile único en raíz.
- **Web** (`apps/web`, `@trackerstat/web`): Next.js 16 App Router · React 19 · Tailwind 4 · shadcn/ui · TanStack Query · tRPC client · Zod
- **API** (`apps/api`, `@trackerstat/api`): Fastify 5 + tRPC 11 + Pino + Zod
- **Database** (`packages/database`, `@trackerstat/database`): Prisma 6 + Postgres 16. Exporta `prisma` client y tipos.
- **Local services**: Postgres + Redis vía `docker-compose.yml`
- **Workers / desktop / ui / sdk**: scaffold vacío, no tocar sin plan

## Comandos

```bash
# Setup
pnpm install
pnpm docker:up              # Postgres + Redis
pnpm db:generate            # Prisma Client
pnpm db:push                # schema → DB

# Dev
pnpm dev                    # alias de dev:web
pnpm dev:web                # :9090
pnpm dev:api                # :4000

# Quality
pnpm typecheck              # todo el workspace
pnpm check                  # biome lint + format check
pnpm check:fix              # auto-fix
pnpm build                  # build completo (web + api)
```

## Calidad

- **Biome 2** es la única fuente de verdad para lint + format. No hay ESLint ni Prettier.
- **TypeScript estricto** en todos los paquetes. `ignoreBuildErrors: false` en web.
- **Lefthook**: `biome check --write` en pre-commit · `pnpm typecheck` en pre-push.
- **CI** (`.github/workflows/ci.yml`): install → quality/typecheck/build en paralelo.

## Convenciones

- Estilo JS: comillas simples, sin `;`, trailing commas, 2 espacios, líneas ≤100 (ver `biome.json`).
- Alias importables: `@/*` → `apps/web/src/*`.
- Imports entre paquetes: `@trackerstat/<package>` (workspace:*).
- Componentes UI en `apps/web/src/components/ui/` (shadcn — excluidos de Biome).
- Features nuevas en `apps/web/src/features/<domain>/`.
- Types compartidos entre api ↔ web van via inferencia tRPC (no duplicar tipos manualmente).

## Lo que NO debes hacer sin preguntar

- Añadir un segundo linter/formatter (ya tenemos Biome).
- Meter Prisma queries directamente en `apps/web` — todo pasa por tRPC → `@trackerstat/database`.
- Implementar features de 9 juegos a la vez; estrategia acordada es **vertical slice primero con LoL**, luego replicar.
- Instalar deps pesadas (gsap, three, socket.io, etc.) sin justificar — ya limpiamos una ronda de cruft.
- Reemplazar los mocks de `apps/web/src/app/api/stats/*` sin tener el endpoint real + DB poblada primero.

## Documentación relevante

- [README.md](README.md) — visión aspiracional (20 pasos). Sigue siendo roadmap, no estado actual.
- [docs/architecture/system-design.md](docs/architecture/system-design.md) — **fuente de verdad** de arquitectura.
- [apps/web/SPEC.md](apps/web/SPEC.md) — spec de la web app.

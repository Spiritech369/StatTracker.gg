# TrackerStat.gg

Arquitectura objetivo y lista tecnica completa para construir una plataforma del nivel de U.GG o superior.

Este README no describe solo la UI actual. Define lo que falta implementar, en orden estricto, para convertir el proyecto en un ecosistema real de analitica competitiva, companion app, SEO programatico, perfiles persistentes, monetizacion y coaching.

## Estado actual

Hoy el proyecto es principalmente:

- frontend Next.js con App Router
- shell de producto con varias vistas internas
- datos mock estructurados para champions/builds/matchups
- integracion parcial con Riot Data Dragon
- lookup de perfil Riot preparado para prototipo

No existe aun:

- backend real
- base de datos
- cache
- cola de trabajos
- auth
- billing
- analytics
- SEO programatico real
- companion app de escritorio
- pipeline de datos por parche

## Objetivo real

Construir una plataforma que compita con U.GG, Mobalytics y otros lideres en:

- League of Legends
- Teamfight Tactics
- Valorant
- Deadlock
- Dota 2
- juegos adicionales con modelo por juego

Y que supere a la competencia en:

- personalizacion
- explicabilidad
- coaching contextual
- scouting
- retencion
- producto para equipos

## Arbol de carpetas objetivo

```txt
trackerstat/
  apps/
    web/                    # Frontend principal SEO + producto
      src/
        app/
        routes/
        layouts/
        pages/
          lol/
          tft/
          valorant/
          profiles/
          billing/
          search/
        features/
          auth/
          search/
          favorites/
          missions/
          subscriptions/
        components/
        hooks/
        lib/
        styles/
        tests/
    api/                    # API publica e interna
      src/
        main/
        modules/
          auth/
          users/
          riot/
          lol/
          tft/
          valorant/
          search/
          profiles/
          leaderboards/
          billing/
          notifications/
          analytics/
        shared/
        middleware/
        tests/
    workers/                # Jobs asincronos y pipelines
      src/
        jobs/
          ingest/
          aggregate/
          normalize/
          patch-refresh/
          search-index/
          profile-refresh/
          notifications/
        pipelines/
          riot/
          tft/
          valorant/
        shared/
        tests/
    desktop/                # Companion app Windows
      src/
        main/
        renderer/
        overlays/
        sync/
        updater/
        permissions/
  packages/
    ui/                     # Sistema de diseno compartido
    types/                  # Tipos compartidos
    config/                 # Config global y env schema
    database/               # ORM, schema, migrations, seeds
    analytics/              # Eventos y tracking helpers
    sdk/                    # Cliente tipado para API
    eslint-config/
    tsconfig/
  infra/
    docker/
    k8s/
    terraform/
    monitoring/
    nginx/
  scripts/
    bootstrap/
    backfill/
    smoke/
  docs/
    architecture/
    product/
    data/
    runbooks/
  .github/
    workflows/
```

## Servicios exactos

### 1. Web app

Responsabilidad:

- pages indexables
- perfiles de usuario
- champion pages
- builds
- counters
- leaderboards
- TFT comps
- premium
- search

Responsabilidades tecnicas:

- renderizar superficies SEO por juego, entidad, parche, rango y region
- consumir la API tipada y nunca depender de proveedores externos desde el cliente
- resolver estados `loading`, `error`, `empty`, `stale` y `premium-gated`
- hidratar filtros de pagina desde URL para que cada superficie sea compartible e indexable
- manejar sesion, favoritos, historial, busquedas guardadas y preferencias del usuario
- disparar eventos analiticos de page view, busqueda, conversion y retencion
- servir como capa de presentacion, no como fuente de verdad de datos

Rutas objetivo minimas:

- `/`
- `/lol`
- `/lol/tier-list`
- `/lol/champions/:champion/build`
- `/lol/champions/:champion/counters`
- `/lol/champions/:champion/runes`
- `/lol/champions/:champion/items`
- `/lol/champions/:champion/skills`
- `/lol/pro-builds`
- `/lol/leaderboards`
- `/profiles/:region/:riotId`
- `/search`
- `/premium`
- `/tft/comps`
- `/tft/comps/:slug`

Modulos internos:

- `src/app`
  - providers globales
  - bootstrap de sesion, tema, telemetria y query client
- `src/routes`
  - definicion de rutas, loaders y guards
- `src/layouts`
  - shells por juego y por superficie
- `src/pages/lol`
  - home LoL, tier list, champion pages, build pages, counter pages, runes, items y skills
- `src/pages/tft`
  - comps, units, augments, traits, positioning y tempo
- `src/pages/valorant`
  - vertical separada, sin reciclar el modelo de LoL
- `src/pages/profiles`
  - perfiles publicos, privados, historial, favoritos y progreso
- `src/pages/billing`
  - premium, checkout states, portal y feature access
- `src/pages/search`
  - smart search, autocomplete, resultados mixtos y multisearch
- `src/features/auth`
  - sesion, login, logout, account linking
- `src/features/search`
  - search bar global, query state y resultados
- `src/features/favorites`
  - guardados por usuario y accesos rapidos
- `src/features/missions`
  - misiones, progreso y re-engagement
- `src/features/subscriptions`
  - gating, entitlement checks y banners premium

Contratos que debe consumir:

- `GET /api/v1/lol/champions`
- `GET /api/v1/lol/champions/:champion/build`
- `GET /api/v1/lol/champions/:champion/counters`
- `GET /api/v1/lol/tier-list`
- `GET /api/v1/tft/comps`
- `GET /api/v1/search`
- `GET /api/v1/profiles/:region/:riotId`
- `POST /api/v1/auth/session`
- `POST /api/v1/billing/checkout`

Estado local permitido:

- UI state efimero
- filtros y ordenamientos reflejados en URL
- cache cliente de respuestas API
- preferencias temporales de interfaz

Estado local prohibido como fuente principal:

- catalogos maestros
- perfiles persistentes
- build logic de produccion
- recomendaciones oficiales
- agregados de metajuego

Criterios de implementacion:

- usar routing real con URLs estables e indexables
- usar fetch layer centralizado o SDK, nunca fetch ad-hoc por componente
- separar `page`, `feature`, `component` y `lib`
- dejar cada pagina preparada para SSR/SSG cuando migremos desde Vite puro
- soportar desktop y mobile sin duplicar logica de dominio

### 2. API app

Responsabilidad:

- auth
- lectura de datos agregados
- busqueda
- perfil de usuario
- billing
- favoritos
- historial
- feature flags
- endpoints internos para desktop

### 3. Workers app

Responsabilidad:

- ingestión de Riot API y otras APIs
- transformacion y normalizacion
- agregaciones por parche/rango/region
- reconstruccion de search index
- refresh de perfiles
- refresh de patch data
- tareas programadas

### 4. Desktop app

Responsabilidad:

- companion app
- overlays permitidos
- importaciones automaticas
- sincronizacion con perfil
- post-game hooks
- auto update

### 5. Database package

Responsabilidad:

- schema
- migrations
- seeds
- read models
- materialized views o tablas agregadas

### 6. Analytics package

Responsabilidad:

- eventos de producto
- funnels
- conversion
- uso de features
- retencion

## Stack tecnico objetivo

## Frontend

- React
- Next.js o Remix para routing real y SEO fuerte
- Tailwind
- TanStack Query
- Zod
- Zustand o equivalente para estado local

## Backend

- FastAPI o NestJS
- PostgreSQL
- Redis
- Celery/RQ si Python, BullMQ si Node
- OpenSearch o Elasticsearch para search avanzado

## Infra

- Docker
- CI/CD con GitHub Actions
- Vercel o frontend CDN
- backend en Fly, Railway, Render, ECS o Kubernetes
- Sentry
- PostHog o Amplitude

## Billing

- Stripe o Lemon Squeezy

## Companion app

- Tauri o Electron

## Modelo de datos que debes implementar

### Catalogo base

- `games`
- `regions`
- `patches`
- `queues`
- `ranks`
- `champions`
- `items`
- `runes`
- `summoner_spells`
- `traits`
- `units`
- `augments`
- `agents`
- `maps`

### Identidad y usuario

- `users`
- `sessions`
- `linked_accounts`
- `user_profiles`
- `favorites`
- `saved_searches`
- `missions`
- `mission_progress`
- `notifications`
- `subscriptions`

### Partidas y datos crudos

- `matches`
- `match_participants`
- `match_teams`
- `match_events`
- `match_timelines`
- `raw_ingest_logs`

### Agregados LoL

- `champion_patch_stats`
- `champion_role_stats`
- `build_stats`
- `rune_stats`
- `item_stats`
- `matchup_stats`
- `duo_stats`
- `objective_control_stats`
- `leaderboard_snapshots`
- `pro_build_snapshots`

### Agregados TFT

- `tft_comp_stats`
- `tft_comp_units`
- `tft_comp_augments`
- `tft_comp_items`
- `tft_positioning_guides`
- `tft_tempo_guides`

### Producto e IA

- `coach_reports`
- `player_diagnoses`
- `draft_reports`
- `clip_reviews`
- `feature_flags`
- `experiments`

## Superficies de producto que debes construir

### League of Legends

- home
- tier list global
- tier list por rol
- champion page
- build page
- runes page
- item page
- skill order page
- counter page
- best picks page
- lane counters
- duo tier list
- objective control tier list
- pro builds
- champion leaderboards
- player profile
- live game
- multisearch
- patch radar
- aram

### TFT

- comps
- comp detail
- traits
- units
- augments
- itemization
- positioning
- tempo guides
- leveling guides
- top 4 stats
- mode-specific pages

### Valorant y otros juegos

- modelo separado por juego
- pages por entidad real del juego
- no reciclar modelo LoL donde no aplique

## SEO programatico que debes implementar

- rutas reales por champion, role, patch, rank, region
- rutas por matchup
- rutas por item
- rutas por build
- rutas por TFT comp
- rutas por trait
- rutas por perfil
- sitemaps por vertical
- canonical tags
- schema markup
- Open Graph
- linking interno entre surfaces
- breadcrumbs
- paginacion indexable

## Ciencia de datos que debes implementar

- clasificacion real de roles
- normalizacion de winrate entre rangos mezclados
- pick rate
- ban rate
- win rate
- sample size
- confidence score
- GD15
- XPD15
- CSD15
- KP
- damage share
- objective control
- PBI
- best pick score
- lane pressure score
- build recommendation score
- TFT top4 rate
- TFT average placement
- TFT tempo windows

## Search que debes implementar

- smart search multi-entidad
- autocomplete
- typo tolerance
- resultados por champion
- resultados por summoner
- resultados por matchup
- resultados por comp
- resultados por item
- resultados por trait
- multisearch
- busquedas guardadas

## Auth y cuenta

- registro/login
- OAuth
- enlace de Riot ID
- configuracion de region
- configuracion de juego principal
- favoritos
- historial
- perfiles publicos
- perfiles privados
- preferencias de coaching

## Monetizacion

- plan free
- plan plus
- plan team
- feature gating
- paywall server-side
- free trial
- billing portal
- invoices
- webhooks
- ad-free mode
- feature flags premium

## Analitica de producto

- eventos de busqueda
- eventos de page view
- eventos de save/favorite
- eventos de profile lookup
- eventos de subscription
- funnels de conversion
- cohorts
- retencion
- A/B testing

## Companion app

- login sincronizado
- descarga e instalacion
- deteccion de partida
- overlays
- auto-import de runas/builds donde sea legal
- post-game sync
- update channel
- crash reporting
- permisos y cumplimiento

## IA y coaching

- coach de perfil
- coach de draft
- coach post-match
- patch explainer
- explicacion contextual de builds
- explicacion contextual de counters
- misiones personalizadas
- deteccion de errores repetidos
- reportes para equipo

La IA debe montarse sobre datos propios y explicables. No debe ser la base del producto; debe ser una capa sobre estadistica, perfiles y contexto.

## Seguridad y cumplimiento

- nunca usar Riot API key en frontend
- backend proxy seguro para Riot
- secret management
- rate limiting
- validacion de inputs
- auditoria de billing
- manejo de sesiones
- cumplimiento con politicas de Riot y de cada publisher

## Calidad y observabilidad

- unit tests
- integration tests
- E2E tests
- data quality checks
- smoke tests
- contract tests web/api
- logging estructurado
- metrics
- tracing
- Sentry
- alertas

## Orden estricto de implementacion

1. Reorganizar repo a monorepo.
2. Crear `apps/api`, `apps/workers`, `packages/database`, `packages/types`, `packages/sdk`.
3. Definir schema de base de datos y migraciones.
4. Implementar auth, usuarios y linked accounts.
5. Implementar proxy seguro para Riot y mover integraciones fuera del frontend.
6. Implementar ingestión de Data Dragon y catalogo base.
7. Implementar ingestión de matches y perfiles.
8. Implementar normalizacion, clasificacion de roles y agregaciones.
9. Implementar search index y smart search real.
10. Reemplazar Vite-only app por app con routing real y SEO.
11. Construir LoL champion/build/counter/tier-list/profile pages.
12. Construir leaderboards, pro builds, multisearch y live game.
13. Construir sistema de favoritos, historial y perfiles persistentes.
14. Integrar billing, paywall y feature gating.
15. Integrar analytics de producto y experimentos.
16. Construir TFT completo.
17. Construir verticales de Valorant y otros juegos.
18. Construir desktop app.
19. Construir capa de IA y coaching.
20. Construir team product, scouting y clip review.

## Orden de implementacion dentro del frontend web

1. routing real
2. layouts por juego
3. cliente SDK para API
4. estados de loading/error/empty
5. pages SEO
6. componentes reutilizables de tablas, filtros y charts
7. search global
8. perfil y cuenta
9. premium

## Orden de implementacion dentro de workers

1. catalog ingest
2. profile refresh
3. match ingest
4. timeline ingest
5. aggregation jobs
6. patch refresh
7. search index rebuild
8. report generation

## Orden de implementacion dentro de data science

1. role classifier
2. rank normalization
3. core rates
4. matchup and lane pressure
5. build scoring
6. PBI
7. duo synergy
8. TFT tempo and comp scoring
9. player diagnosis features

## Lo que debe salir del frontend actual

Mover fuera de `apps/web` o refactorizar:

- lookup Riot directo desde frontend
- datos mock como fuente principal
- logica entera en un solo `App.tsx`
- mezcla de stacks incompatibles dentro de `apps/web`

## Lo que puede quedarse del frontend actual

- direccion visual general
- componentes presentacionales reutilizables
- estructura conceptual de overview/profile/builds/counters
- branding inicial

## Notas de estructura actuales

La base activa del frontend es `Next.js` dentro de `apps/web/src/app`.

Todo lo que pertenezca al shell anterior de `Vite + React Router` debe vivir como referencia o legado, no mezclado en la ruta principal de ejecucion del producto.

## Fuente unica de verdad

La fuente de verdad del producto no debe ser el frontend. Debe ser:

1. base de datos
2. agregados versionados por parche
3. API tipada
4. search index
5. workers de refresh

## Regla de producto

No construir features “wow” antes de tener estas cuatro capas solidas:

1. data ingestion
2. aggregation
3. SEO surfaces
4. profiles + retention

## Siguiente paso recomendado

El siguiente documento que debes crear despues de este README es:

- `docs/architecture/system-design.md`

Y debe incluir:

- diagrama de servicios
- schema inicial de DB
- contratos API
- modelo de jobs
- estrategia de cache
- estrategia de despliegue

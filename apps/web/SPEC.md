# AI Nexus - Directorio & News de IAs

## Concept & Vision

**AI Nexus** es un hub interactivo para descubrir, comparar y estar al día con el ecosistema de IAs. La experiencia se siente como un "Bloomberg terminal para IAs" - denso en información pero elegante, donde cada IA tiene su carta de presentación con métricas, precios, features y noticias recientes. El tono es de insider profesional: no marketing, datos reales.

## Design Language

### Aesthetic Direction
Inspirado en dashboards financieros premium (Bloomberg, Reuters) mezclado con la energía cyberpunk de interfaces sci-fi. Fondo oscuro con acentos neón sutiles, tipografía técnica.

### Color Palette
- **Background**: `#0a0a0f` (negro profundo)
- **Surface**: `#12121a` (cards)
- **Border**: `#1e1e2e` (separadores)
- **Primary**: `#00d4ff` (cyan neón)
- **Secondary**: `#7c3aed` (violeta)
- **Accent**: `#10b981` (verde para "open source"/free)
- **Warning**: `#f59e0b` (nuevo/trending)
- **Text Primary**: `#f1f5f9`
- **Text Secondary**: `#94a3b8`

### Typography
- **Headings**: JetBrains Mono (técnico, premium)
- **Body**: Inter (legible, moderno)
- **Mono/Code**: Fira Code

### Spatial System
- Grid de 12 columnas responsive
- Cards con padding 24px, border-radius 12px
- Espaciado vertical consistente de 16px/24px/32px

### Motion Philosophy
- Transiciones suaves 200-300ms ease-out
- Hover en cards: lift sutil (translateY -2px) + glow del borde
- Loading skeleton con pulse animation
- Scroll reveal staggered para grids

### Visual Assets
- Iconos: Lucide Icons (línea fina, consistente)
- Logos de IAs: SVG inline o emojis estilizados
- Badges para categorías: chips con colores semánticos

## Layout & Structure

### Header
- Logo "AI Nexus" con icono de red neuronal
- Barra de búsqueda prominent
- Toggle tema (futuro)
- Indicador "Last updated: [fecha]"

### Hero Section
- Headline impactante sobre el estado del ecosistema IA
- Stats quick: "500+ IAs", "12 categorías", "Actualizado diario"

### Navigation Tabs (sticky)
Categorías principales como tabs:
- All | General | Agents | Code | Video | Audio | Image | Business | Research | China | Open Source

### Main Content
1. **Featured IAs** - Cards destacadas con más detalle
2. **Category Grids** - IAs organizadas por categoría
3. **Daily News Feed** - Últimas actualizaciones/features
4. **Rising Stars** - IAs que están ganando tracción

### AI Card (detalle)
```
┌─────────────────────────────────────────┐
│ [Logo]  Nombre                [Badge]  │
│         Creador / Empresa               │
├─────────────────────────────────────────┤
│ ⭐ 4.8  |  💰 Freemium  |  🔓 Open Src │
├─────────────────────────────────────────┤
│ 📝 Descripción corta                    │
├─────────────────────────────────────────┤
│ 🎯 Best for: [casos de uso]            │
│ 🔥 Latest: [feature reciente]          │
├─────────────────────────────────────────┤
│ [Website] [Docs] [Twitter]              │
└─────────────────────────────────────────┘
```

### News Card
```
┌─────────────────────────────────────────┐
│ 📰 Título de la noticia                │
│ hace 2 horas · fuente                   │
├─────────────────────────────────────────┤
│ Preview del contenido...                │
│ [Leer más →]                            │
└─────────────────────────────────────────┘
```

### Footer
- Disclaimer
- Contribuir / Sugerir IA
- Social links

## Features & Interactions

### Core Features

1. **Exploración por Categoría**
   - Click en tab → filtra grid
   - Smooth scroll a sección
   - Contador de IAs por categoría

2. **Búsqueda Inteligente**
   - Busca por nombre, descripción, tags
   - Resultados instantáneos (debounce 200ms)
   - Highlights en matches

3. **Filtros**
   - Pricing: Free, Freemium, Paid, Open Source
   - Categoría múltiple
   - Sort: Popular, Recent, A-Z

4. **Detail Modal**
   - Click en card → modal con info expandida
   - Tabla comparativa si aplica
   - Link directo a web/docs

5. **News Feed**
   - Scroll infinito o "Load more"
   - Filtrar por categoría
   - Marcar como leído (localStorage)

6. **Favoritos**
   - Star button en cada card
   - Guardado en localStorage
   - Vista "My Collection"

### Micro-interactions
- **Hover en card**: Elevación + glow cyan
- **Click en star**: Animación de pulse + toast "Added to favorites"
- **Search focus**: Expands con animación
- **Tab switch**: Underline slide animation
- **Modal open**: Scale from 0.9 + fade

### Edge Cases
- **No results**: Ilustración + "No IAs found. Try different search."
- **Loading**: Skeleton cards con pulse
- **Error news**: "Unable to load news. [Retry]"

## Component Inventory

### AI Card Component
- States: default, hover, favorited, new (badge warning)
- Variants: compact (grid), expanded (featured)

### News Card Component
- States: default, hover, read (opacity reduced)
- Variants: compact, expanded

### Search Input
- States: default, focused, filled
- Icon: magnifier left, clear button right

### Tab Bar
- States: default, active, hover
- Active indicator: underline animado

### Filter Chips
- States: default, active, disabled
- Multi-select behavior

### Modal
- Overlay con blur
- Close: X button, ESC key, click outside

### Toast Notification
- Appears bottom-right
- Auto-dismiss 3s
- Types: success (green), info (cyan), warning (yellow)

## Technical Approach

### Stack
- **Single HTML file** con CSS y JS embebido
- **No framework** - vanilla JS para máxima portabilidad
- **LocalStorage** para favoritos y preferencias
- **Data embebido** - JSON con IAs y news (actualizable)

### Data Model
```javascript
{
  ais: [{
    id: string,
    name: string,
    logo: string, // emoji o SVG
    creator: string,
    category: string[],
    pricing: "free" | "freemium" | "paid" | "open",
    description: string,
    bestFor: string[],
    latestFeature: string,
    website: string,
    docs: string,
    twitter: string,
    rating: number,
    isNew: boolean,
    addedDate: string
  }],
  news: [{
    id: string,
    title: string,
    source: string,
    date: string,
    category: string[],
    excerpt: string,
    url: string,
    relatedAIs: string[]
  }],
  lastUpdated: string
}
```

### Architecture
- Module pattern para organizar código
- Event delegation para performance
- Intersection Observer para lazy loading
- Debounce para search

### Performance
- Critical CSS inline
- Minimal dependencies (solo fonts via CDN)
- Efficient DOM updates
- localStorage caching para favoritos

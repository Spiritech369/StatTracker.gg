// =============================================================================
// Site Configuration
// Edit ONLY this file to customize all content across the site.
// All animations, layouts, and styles are controlled by the components.
// =============================================================================

// -- Site-wide settings -------------------------------------------------------
export interface SiteConfig {
  title: string
  description: string
  language: string
}

export const siteConfig: SiteConfig = {
  title: 'StatTracker.gg - Ultimate Gaming Analytics',
  description:
    'Track your gaming performance with professional-grade statistics, champion analytics, and real-time leaderboards. The ultimate tool for competitive gamers.',
  language: 'en',
}

// -- Hero Section -------------------------------------------------------------
export interface HeroNavItem {
  label: string
  sectionId: string
  icon: 'disc' | 'play' | 'calendar' | 'music'
}

export interface HeroConfig {
  backgroundImage: string
  brandName: string
  decodeText: string
  decodeChars: string
  subtitle: string
  ctaPrimary: string
  ctaPrimaryTarget: string
  ctaSecondary: string
  ctaSecondaryTarget: string
  cornerLabel: string
  cornerDetail: string
  navItems: HeroNavItem[]
}

export const heroConfig: HeroConfig = {
  backgroundImage: '/hero-bg.jpg',
  brandName: 'StatTracker.gg',
  decodeText: 'DOMINATE THE GAME',
  decodeChars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*',
  subtitle:
    'Professional-grade analytics for competitive gamers. Track stats, analyze champions, and climb the ranks with data-driven insights.',
  ctaPrimary: 'View Champions',
  ctaPrimaryTarget: 'champions',
  ctaSecondary: 'Explore Tournaments',
  ctaSecondaryTarget: 'tournaments',
  cornerLabel: 'LIVE STATS',
  cornerDetail: '2.4M+ Players Tracked',
  navItems: [
    { label: 'Champions', sectionId: 'champions', icon: 'disc' },
    { label: 'Highlights', sectionId: 'highlights', icon: 'play' },
    { label: 'Tournaments', sectionId: 'tournaments', icon: 'calendar' },
    { label: 'Community', sectionId: 'community', icon: 'music' },
  ],
}

// -- Album Cube Section (Champions Cube) -------------------------------------------------------
export interface Album {
  id: number
  title: string
  subtitle: string
  image: string
}

export interface AlbumCubeConfig {
  albums: Album[]
  cubeTextures: string[]
  scrollHint: string
}

export const albumCubeConfig: AlbumCubeConfig = {
  albums: [
    { id: 1, title: 'AETHERION', subtitle: 'THE LIGHTBRINGER', image: '/champion-1.jpg' },
    { id: 2, title: 'SHADOWBLADE', subtitle: 'THE SILENT KILLER', image: '/champion-2.jpg' },
    { id: 3, title: 'ARCANUS', subtitle: 'THE WISE', image: '/champion-3.jpg' },
    { id: 4, title: 'BLOODLORD', subtitle: 'THE UNYIELDING', image: '/champion-4.jpg' },
  ],
  cubeTextures: [
    '/champion-1.jpg',
    '/champion-2.jpg',
    '/champion-3.jpg',
    '/champion-4.jpg',
    '/champion-5.jpg',
    '/champion-6.jpg',
  ],
  scrollHint: 'SCROLL TO EXPLORE CHAMPIONS',
}

// -- Parallax Gallery Section (Gameplay Highlights) -------------------------------------------------
export interface ParallaxImage {
  id: number
  src: string
  alt: string
}

export interface GalleryImage {
  id: number
  src: string
  title: string
  date: string
}

export interface ParallaxGalleryConfig {
  sectionLabel: string
  sectionTitle: string
  galleryLabel: string
  galleryTitle: string
  marqueeTexts: string[]
  endCtaText: string
  parallaxImagesTop: ParallaxImage[]
  parallaxImagesBottom: ParallaxImage[]
  galleryImages: GalleryImage[]
}

export const parallaxGalleryConfig: ParallaxGalleryConfig = {
  sectionLabel: 'EPIC MOMENTS',
  sectionTitle: 'GAMEPLAY HIGHLIGHTS',
  galleryLabel: 'MATCH ARCHIVE',
  galleryTitle: 'LEGENDARY PLAYS',
  marqueeTexts: [
    'PENTAKILL',
    'EPIC COMEBACK',
    'DRAGON STEAL',
    'BARON SECURE',
    'ACE',
    'VICTORY',
    'DOMINATION',
    'LEGENDARY',
  ],
  endCtaText: 'VIEW ALL HIGHLIGHTS',
  parallaxImagesTop: [
    { id: 1, src: '/gameplay-1.jpg', alt: 'Team Fight' },
    { id: 2, src: '/gameplay-2.jpg', alt: 'Dragon Objective' },
    { id: 3, src: '/gameplay-3.jpg', alt: 'Nexus Destruction' },
    { id: 4, src: '/gameplay-4.jpg', alt: 'Jungle Gank' },
    { id: 5, src: '/gameplay-5.jpg', alt: 'Baron Fight' },
    { id: 6, src: '/gameplay-6.jpg', alt: 'Pentakill' },
  ],
  parallaxImagesBottom: [
    { id: 7, src: '/gameplay-6.jpg', alt: 'Pentakill Moment' },
    { id: 8, src: '/gameplay-5.jpg', alt: 'Baron Nashor' },
    { id: 9, src: '/gameplay-4.jpg', alt: 'Gank' },
    { id: 10, src: '/gameplay-3.jpg', alt: 'Final Push' },
    { id: 11, src: '/gameplay-2.jpg', alt: 'Dragon Steal' },
    { id: 12, src: '/gameplay-1.jpg', alt: 'Team Battle' },
  ],
  galleryImages: [
    { id: 1, src: '/gameplay-1.jpg', title: 'Worlds Finals 2024', date: '2024.11.02' },
    { id: 2, src: '/gameplay-2.jpg', title: 'MSI Champions', date: '2024.05.19' },
    { id: 3, src: '/gameplay-3.jpg', title: 'LCK Spring Split', date: '2024.03.14' },
    { id: 4, src: '/gameplay-4.jpg', title: 'LEC Winter Finals', date: '2024.02.28' },
    { id: 5, src: '/gameplay-5.jpg', title: 'LCS Championship', date: '2024.08.25' },
    { id: 6, src: '/gameplay-6.jpg', title: 'All-Star Showdown', date: '2024.12.07' },
  ],
}

// -- Tour Schedule Section (Tournament Schedule) ----------------------------------------------------
export interface TourDate {
  id: number
  date: string
  time: string
  city: string
  venue: string
  status: 'on-sale' | 'sold-out' | 'coming-soon'
  image: string
}

export interface TourStatusLabels {
  onSale: string
  soldOut: string
  comingSoon: string
  default: string
}

export interface TourScheduleConfig {
  sectionLabel: string
  sectionTitle: string
  vinylImage: string
  buyButtonText: string
  detailsButtonText: string
  bottomNote: string
  bottomCtaText: string
  statusLabels: TourStatusLabels
  tourDates: TourDate[]
}

export const tourScheduleConfig: TourScheduleConfig = {
  sectionLabel: 'COMPETITIVE SCENE',
  sectionTitle: 'UPCOMING TOURNAMENTS',
  vinylImage: '/trophy-disc.png',
  buyButtonText: 'GET TICKETS',
  detailsButtonText: 'VIEW DETAILS',
  bottomNote: 'MORE EVENTS ANNOUNCED SOON',
  bottomCtaText: 'SUBSCRIBE FOR UPDATES',
  statusLabels: {
    onSale: 'TICKETS AVAILABLE',
    soldOut: 'SOLD OUT',
    comingSoon: 'COMING SOON',
    default: 'ANNOUNCING',
  },
  tourDates: [
    {
      id: 1,
      date: '2025.01.15',
      time: '18:00',
      city: 'Seoul',
      venue: 'LOL Park',
      status: 'on-sale',
      image: '/venue-seoul.jpg',
    },
    {
      id: 2,
      date: '2025.02.22',
      time: '17:00',
      city: 'Los Angeles',
      venue: 'Riot Games Arena',
      status: 'on-sale',
      image: '/venue-la.jpg',
    },
    {
      id: 3,
      date: '2025.03.08',
      time: '19:00',
      city: 'Berlin',
      venue: 'LEC Studio',
      status: 'coming-soon',
      image: '/venue-berlin.jpg',
    },
    {
      id: 4,
      date: '2025.04.12',
      time: '16:00',
      city: 'Shanghai',
      venue: 'Mercedes-Benz Arena',
      status: 'coming-soon',
      image: '/tournament-1.jpg',
    },
  ],
}

// -- Footer Section -----------------------------------------------------------
export interface FooterImage {
  id: number
  src: string
}

export interface SocialLink {
  icon: 'instagram' | 'twitter' | 'youtube' | 'music'
  label: string
  href: string
}

export interface FooterConfig {
  portraitImage: string
  portraitAlt: string
  heroTitle: string
  heroSubtitle: string
  artistLabel: string
  artistName: string
  artistSubtitle: string
  brandName: string
  brandDescription: string
  quickLinksTitle: string
  quickLinks: string[]
  contactTitle: string
  emailLabel: string
  email: string
  phoneLabel: string
  phone: string
  addressLabel: string
  address: string
  newsletterTitle: string
  newsletterDescription: string
  newsletterButtonText: string
  subscribeAlertMessage: string
  copyrightText: string
  bottomLinks: string[]
  socialLinks: SocialLink[]
  galleryImages: FooterImage[]
}

export const footerConfig: FooterConfig = {
  portraitImage: '/pro-player.jpg',
  portraitAlt: 'Professional Gamer',
  heroTitle: 'JOIN THE ELITE',
  heroSubtitle: 'ELEVATE YOUR GAME',
  artistLabel: 'FEATURED PRO',
  artistName: 'Faker',
  artistSubtitle: '4X WORLD CHAMPION',
  brandName: 'StatTracker.gg',
  brandDescription:
    'The ultimate gaming analytics platform for competitive players. Track your performance, analyze champions, and dominate the leaderboard with professional-grade statistics.',
  quickLinksTitle: 'QUICK LINKS',
  quickLinks: ['Champion Stats', 'Leaderboards', 'Match History', 'Pro Builds', 'Tier Lists'],
  contactTitle: 'CONTACT',
  emailLabel: 'Email',
  email: 'support@stattracker.gg',
  phoneLabel: 'Discord',
  phone: 'discord.gg/stattracker',
  addressLabel: 'HQ',
  address: 'Los Angeles, California',
  newsletterTitle: 'STAY UPDATED',
  newsletterDescription: 'Subscribe for the latest patch notes, meta updates, and tournament news.',
  newsletterButtonText: 'SUBSCRIBE',
  subscribeAlertMessage: 'Thanks for subscribing! Check your email for updates.',
  copyrightText: '© 2025 StatTracker.gg. All rights reserved.',
  bottomLinks: ['Privacy Policy', 'Terms of Service', 'Cookie Settings'],
  socialLinks: [
    { icon: 'twitter', label: 'Twitter', href: 'https://twitter.com/stattracker' },
    { icon: 'youtube', label: 'YouTube', href: 'https://youtube.com/stattracker' },
    { icon: 'instagram', label: 'Instagram', href: 'https://instagram.com/stattracker' },
    { icon: 'music', label: 'Discord', href: 'https://discord.gg/stattracker' },
  ],
  galleryImages: [
    { id: 1, src: '/champion-1.jpg' },
    { id: 2, src: '/champion-2.jpg' },
    { id: 3, src: '/champion-3.jpg' },
    { id: 4, src: '/champion-4.jpg' },
  ],
}

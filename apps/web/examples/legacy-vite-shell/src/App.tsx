import { useEffect, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Brain,
  Check,
  ChevronRight,
  Crown,
  Download,
  Eye,
  Flame,
  Gamepad2,
  Gem,
  LineChart,
  Radar,
  Search,
  Shield,
  Sparkles,
  Swords,
  Target,
  Trophy,
  Users,
  WandSparkles,
  Zap,
} from 'lucide-react';
import { buildGuides, championSupplemental, matchupGuides } from './data/gameData';
import './index.css';
import useLenis from './hooks/useLenis';
import {
  getChampionDirectory,
  getChampionImageUrl,
  lookupRiotProfileByRiotId,
  type WebChampionDirectory,
  type WebChampionSummary,
  type WebRiotProfile,
} from './lib/apiClient';

export type ProductPageId = 'overview' | 'profile' | 'builds' | 'counters' | 'patch-radar' | 'premium';

type ProductNavItem = {
  id: ProductPageId;
  label: string;
  hint: string;
  icon: LucideIcon;
};

const navGames = ['League of Legends', 'Valorant', 'TFT', 'Deadlock', 'Dota 2'];

const productNav: ProductNavItem[] = [
  { id: 'overview', label: 'Overview', hint: 'Producto y activacion', icon: Radar },
  { id: 'profile', label: 'Profile AI', hint: 'Lectura del jugador', icon: Brain },
  { id: 'builds', label: 'Build Lab', hint: 'Runas, items y spikes', icon: WandSparkles },
  { id: 'counters', label: 'Counter Lab', hint: 'Ventajas y castigos', icon: Swords },
  { id: 'patch-radar', label: 'Patch Radar', hint: 'Meta y oportunidades', icon: Flame },
  { id: 'premium', label: 'Premium', hint: 'Monetizacion y planes', icon: Crown },
];

const trustStats = [
  { value: '84%', label: 'more actionable than static tier-list pages' },
  { value: '+2.7', label: 'weekly wins after guided coaching loops' },
  { value: '12s', label: 'to generate a first player diagnosis' },
];

const smartInsights = [
  'You are an aggressive early-game player and lose tempo after first tower.',
  'Your carry window starts between minute 14 and 22 when you hit second item.',
  'You are 2 wins away from Gold if you avoid low-vision 4v5 fights.',
];

const dashboardCards = [
  {
    icon: LineChart,
    title: 'Live winrate',
    body: 'Your winrate jumps from 51% to 58% when the system pushes scaling picks with front-to-back execution.',
  },
  {
    icon: Brain,
    title: 'AI diagnosis',
    body: 'The most expensive error today was overextending after first tower without river ownership.',
  },
  {
    icon: Target,
    title: 'Improvement plan',
    body: 'Focus on river vision before 5:00 and cleaner reset timings around your first spike.',
  },
];

const liveAssistant = [
  { time: '03:10', title: 'Recall now', body: 'Wave state is clean and enemy jungle just showed topside. Cash in tempo immediately.' },
  { time: '06:00', title: 'Danger spike', body: 'This matchup punishes minute 6 all-ins. Delay trade until your cooldown cycle resets.' },
  { time: '14:20', title: 'Buy this', body: 'Finish the defensive component before the second objective. Teamfight survival climbs by 11%.' },
];

const missions = [
  'Do not die before minute 10',
  'Ward river before 5:00',
  'Win 3 trades in a row with cooldown tracking',
  'Convert every kill into wave, camp or objective value',
];

const premiumFeatures = [
  'Real-time build AI during the match',
  'Matchup prediction and power spike timeline',
  'Voice coach with urgent triggers',
  'Enemy scouting and draft plans',
];

const gameCards = [
  {
    title: 'League of Legends',
    badge: 'Live',
    body: 'Dynamic builds, draft coach, live assistant, enemy scouting and objective plans.',
  },
  {
    title: 'Valorant',
    badge: 'Beta',
    body: 'Agent plans, economy advice, retake protocols and map pressure heatmaps.',
  },
  {
    title: 'Deadlock',
    badge: 'New',
    body: 'Soul routing, lane pressure, power spikes and matchup guidance by tempo.',
  },
  {
    title: 'Dota 2',
    badge: 'Next',
    body: 'Draft intelligence, item timing, macro alerts and tempo interpretation.',
  },
];

const comparisonRows = [
  ['Builds and runes', 'Generic by pickrate', 'Adapted to style, elo and matchup'],
  ['Notifications', 'Passive', 'Triggered by profile, tilt and goal state'],
  ['Retention', 'Informational content', 'Progress, missions and coaching loops'],
  ['Monetization', 'Ads plus cold upsell', 'Value proven live plus premium'],
];

const patchCards = [
  { title: 'Meta swing', body: 'Tank engage is rising because two core anti-burst options lost efficiency.' },
  { title: 'Abuse now', body: 'Scaling mids gain hidden value because lane bullies lost early snowball reliability.' },
  { title: 'Watch out', body: 'Support roam windows are tighter, so delayed warding is punished harder than last patch.' },
];

function formatQueue(queueType: string) {
  return queueType.replace('RANKED_', '').replace('_', ' ');
}

const pricingCards = [
  {
    name: 'Free',
    price: '$0',
    description: 'For discovery and repeat visits.',
    features: ['Profile scan', 'Basic search', 'Starter missions', 'Patch digest'],
  },
  {
    name: 'Plus',
    price: '$9.99',
    description: 'For players who want to climb faster.',
    features: ['Live coaching', 'Advanced build AI', 'Scouting', 'Unlimited analysis'],
  },
  {
    name: 'Team',
    price: '$39',
    description: 'For duos, amateur teams and scrim prep.',
    features: ['Shared dashboards', 'Opponent prep', 'Draft rooms', 'Coach notes'],
  },
];

const productPagePaths: Record<ProductPageId, string> = {
  overview: '/',
  profile: '/profiles',
  builds: '/lol/builds',
  counters: '/lol/counters',
  'patch-radar': '/lol/patch-radar',
  premium: '/premium',
};

function getProductPagePath(page: ProductPageId) {
  return productPagePaths[page];
}

function App({ page = 'overview' }: { page?: ProductPageId }) {
  useLenis();
  const navigate = useNavigate();
  const activePage = page;
  const [championDirectory, setChampionDirectory] = useState<WebChampionDirectory | null>(null);
  const [championQuery, setChampionQuery] = useState('');
  const [selectedChampionId, setSelectedChampionId] = useState('Jinx');
  const [profileQuery, setProfileQuery] = useState('');
  const [profileResult, setProfileResult] = useState<WebRiotProfile | null>(null);
  const [profileStatus, setProfileStatus] = useState<'idle' | 'loading' | 'error' | 'success'>('idle');
  const [profileMessage, setProfileMessage] = useState('Enter a Riot ID like gameName#tagLine.');

  const selectedChampion =
    championDirectory?.champions.find((champion) => champion.id === selectedChampionId) ?? null;
  const championMeta = championSupplemental[selectedChampionId] ?? championSupplemental.Jinx;
  const selectedBuild =
    buildGuides.find((guide) => guide.championId === selectedChampionId) ?? buildGuides[0];
  const selectedMatchups = matchupGuides.filter((guide) => guide.championId === selectedChampionId);
  const filteredChampions = championDirectory?.champions.filter((champion) => {
    if (!championQuery.trim()) return false;
    const query = championQuery.toLowerCase();
    return champion.name.toLowerCase().includes(query) || champion.id.toLowerCase().includes(query);
  }).slice(0, 6) ?? [];

  useEffect(() => {
    document.title = 'TrackerStat.gg | Climb Faster. Win Smarter.';

    const metaViewport = document.querySelector('meta[name="viewport"]');
    if (metaViewport) {
      metaViewport.setAttribute('content', 'width=device-width, initial-scale=1.0');
    }
  }, []);

  useEffect(() => {
    getChampionDirectory()
      .then((directory) => {
        setChampionDirectory(directory);
      })
      .catch(() => {
        setChampionDirectory(null);
      });
  }, []);

  const handleChampionSelect = (championId: string) => {
    setSelectedChampionId(championId);
    setChampionQuery(championId);
  };

  const handleProfileLookup = async () => {
    try {
      setProfileStatus('loading');
      setProfileMessage('Looking up Riot profile...');
      const result = await lookupRiotProfileByRiotId(profileQuery.trim());
      setProfileResult(result);
      setProfileStatus('success');
      setProfileMessage('Live Riot profile loaded.');
      navigate(getProductPagePath('profile'));
    } catch (error) {
      setProfileResult(null);
      setProfileStatus('error');
      setProfileMessage(error instanceof Error ? error.message : 'Could not load Riot profile.');
    }
  };

  return (
    <main className="min-h-screen bg-[#07111f] text-slate-100">
      <Hero
        championDirectory={championDirectory}
        championQuery={championQuery}
        filteredChampions={filteredChampions}
        onChampionQueryChange={setChampionQuery}
        onChampionSelect={(championId) => {
          handleChampionSelect(championId);
          navigate(getProductPagePath('builds'));
        }}
        onProfileQuickLookup={(value) => {
          setProfileQuery(value);
          navigate(getProductPagePath('profile'));
        }}
      />

      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="panel-card xl:sticky xl:top-6 xl:self-start">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-300/25 bg-cyan-300/10">
                <Gamepad2 className="h-5 w-5 text-cyan-200" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Product surfaces</p>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Now feels like a platform</p>
              </div>
            </div>

            <div className="mt-6 space-y-2">
              {productNav.map(({ id, label, hint, icon: Icon }) => {
                const isActive = activePage === id;
                return (
                  <button
                    key={id}
                    className={`flex w-full items-center gap-3 rounded-[22px] border px-4 py-4 text-left transition ${
                      isActive
                        ? 'border-cyan-300/30 bg-cyan-300/10 text-white'
                        : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:bg-white/10'
                    }`}
                      onClick={() => navigate(getProductPagePath(id))}
                    type="button"
                  >
                    <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${isActive ? 'bg-slate-950/70' : 'bg-slate-950/50'}`}>
                      <Icon className="h-4 w-4 text-cyan-200" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{label}</p>
                      <p className="text-xs text-slate-400">{hint}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-6 rounded-[24px] border border-emerald-300/20 bg-emerald-300/10 p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-emerald-100">Retention loop</p>
              <p className="mt-2 text-lg font-semibold text-white">2 wins to Gold</p>
              <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/10">
                <div className="h-full w-4/5 rounded-full bg-gradient-to-r from-emerald-300 via-cyan-300 to-sky-400" />
              </div>
              <p className="mt-3 text-sm text-emerald-50/90">Mission pressure plus live reminders is the hook that keeps users returning.</p>
            </div>
          </aside>

          <div className="grid gap-6">
            {renderActivePage(activePage, {
              navigateToPage: (nextPage) => navigate(getProductPagePath(nextPage)),
              selectedChampion,
              championMeta,
              selectedBuild,
              selectedMatchups,
              championDirectory,
              profileQuery,
              setProfileQuery,
              profileResult,
              profileStatus,
              profileMessage,
              onProfileLookup: handleProfileLookup,
              onChampionSelect: handleChampionSelect,
            })}

            <section className="rounded-[36px] border border-white/10 bg-gradient-to-br from-slate-950/90 via-slate-900/80 to-indigo-950/70 p-8 shadow-[0_20px_120px_rgba(15,23,42,0.5)] backdrop-blur-xl sm:p-10">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-3xl">
                  <p className="section-kicker">Multi-game expansion</p>
                  <h2 className="section-title">Scale like a SaaS platform, not like a one-game stat page</h2>
                  <p className="mt-4 text-base leading-8 text-slate-300">
                    Shared identity, shared progress and shared premium logic let the brand expand into more games
                    without rebuilding the whole business every time.
                  </p>
                </div>
                <button
                  className="inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-5 py-3 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-300/20"
                  onClick={() => navigate(getProductPagePath('premium'))}
                  type="button"
                >
                  See monetization map
                  <Gem className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {gameCards.map((game) => (
                  <article key={game.title} className="rounded-[28px] border border-white/10 bg-white/5 p-6 transition hover:-translate-y-1 hover:border-cyan-300/30">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-white">{game.title}</h3>
                      <span className="rounded-full border border-white/10 bg-slate-950/70 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-slate-300">
                        {game.badge}
                      </span>
                    </div>
                    <p className="mt-4 text-sm leading-7 text-slate-400">{game.body}</p>
                    <button className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-cyan-100" type="button">
                      Explore tools
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </article>
                ))}
              </div>
            </section>

            <footer className="rounded-[32px] border border-white/10 bg-slate-950/80 px-6 py-8 sm:px-8">
              <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr_0.8fr]">
                <div>
                  <p className="font-brand text-lg tracking-[0.24em] text-cyan-200">TRACKERSTAT.GG</p>
                  <p className="mt-4 max-w-xl text-sm leading-7 text-slate-400">
                    Gaming intelligence for competitive players who want to improve faster, return more often and
                    understand the game with real context.
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-white">Core tools</p>
                  <div className="mt-4 grid gap-3 text-sm text-slate-400 sm:grid-cols-2">
                    {['Build AI', 'Counter Lab', 'Live Coach', 'Patch Radar', 'Clip Review', 'Scouting'].map((item) => (
                      <span key={item}>{item}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-white">Revenue layers</p>
                  <div className="mt-4 space-y-3 text-sm text-slate-400">
                    <p>Free: search, profile and starter missions</p>
                    <p>Plus: coaching, predictions and advanced analysis</p>
                    <p>Team: shared prep, scouting and draft workflows</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-3 border-t border-white/10 pt-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                <p>© 2026 TrackerStat.gg. Built to outperform passive stat sites.</p>
                <div className="flex gap-5">
                  <span>Privacy</span>
                  <span>Terms</span>
                  <span>Discord</span>
                </div>
              </div>
            </footer>
          </div>
        </div>
      </section>
    </main>
  );
}

function Hero({
  championDirectory,
  championQuery,
  filteredChampions,
  onChampionQueryChange,
  onChampionSelect,
  onProfileQuickLookup,
}: {
  championDirectory: WebChampionDirectory | null;
  championQuery: string;
  filteredChampions: WebChampionSummary[];
  onChampionQueryChange: (value: string) => void;
  onChampionSelect: (championId: string) => void;
  onProfileQuickLookup: (value: string) => void;
}) {
  return (
    <div className="hero-shell">
      <div className="hero-noise" />
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-300/10 shadow-[0_0_30px_rgba(34,211,238,0.22)]">
            <Trophy className="h-5 w-5 text-cyan-200" />
          </div>
          <div>
            <p className="font-brand text-lg tracking-[0.24em] text-cyan-200">TRACKERSTAT.GG</p>
            <p className="text-xs uppercase tracking-[0.28em] text-slate-400">competitive stats for winning players</p>
          </div>
        </div>

        <nav className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 p-2 backdrop-blur-xl lg:flex">
          {navGames.map((game, index) => (
            <button
              key={game}
              className={`rounded-full px-4 py-2 text-sm transition ${
                index === 0
                  ? 'bg-cyan-300 text-slate-950 shadow-[0_0_30px_rgba(103,232,249,0.35)]'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
              type="button"
            >
              {game}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            className="hidden rounded-full border border-white/15 px-4 py-2 text-sm text-slate-200 transition hover:border-cyan-300/40 hover:bg-white/5 sm:inline-flex"
            type="button"
          >
            Login
          </button>
          <button
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-300 via-sky-400 to-indigo-400 px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-[0_0_32px_rgba(96,165,250,0.35)] transition hover:scale-[1.02]"
            type="button"
          >
            Try Plus
            <Crown className="h-4 w-4" />
          </button>
        </div>
      </header>

      <section className="mx-auto grid w-full max-w-7xl gap-10 px-4 pb-20 pt-6 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:px-8 lg:pb-28 lg:pt-10">
        <div className="max-w-3xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-xs uppercase tracking-[0.28em] text-cyan-100 backdrop-blur-xl">
            <Sparkles className="h-3.5 w-3.5" />
            Personalized from the first scroll
          </div>

          <h1 className="font-brand text-5xl leading-[0.95] text-white sm:text-6xl lg:text-7xl">
            Your AI Coach.
            <span className="block bg-gradient-to-r from-cyan-200 via-sky-300 to-indigo-300 bg-clip-text text-transparent">
              Climb Faster. Win Smarter.
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
            Real-time builds, intelligent scouting, missions, urgency hooks and decision support for League,
            Valorant, Deadlock and more. It does not just show data. It tells you what to do next.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <button
              className="inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-rose-500 via-orange-400 to-amber-300 px-6 py-4 text-base font-semibold text-slate-950 shadow-[0_16px_60px_rgba(251,146,60,0.35)] transition hover:-translate-y-0.5"
              type="button"
            >
              <Download className="h-5 w-5" />
              Analyze My Gameplay
            </button>
            <button
              className="inline-flex items-center justify-center gap-3 rounded-2xl border border-white/15 bg-white/5 px-6 py-4 text-base font-semibold text-white backdrop-blur-xl transition hover:border-cyan-300/40 hover:bg-white/10"
              type="button"
            >
              Start Free AI Coaching
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-8 rounded-[28px] border border-white/10 bg-slate-950/45 p-3 shadow-[0_18px_80px_rgba(8,15,30,0.45)] backdrop-blur-xl">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex flex-1 items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                  <Search className="h-5 w-5 text-cyan-200" />
                  <div className="text-left">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Smart Search</p>
                    <input
                      className="w-full bg-transparent text-sm text-slate-200 outline-none placeholder:text-slate-500"
                      onChange={(event) => onChampionQueryChange(event.target.value)}
                      placeholder={championDirectory ? 'Search a real champion from Data Dragon' : 'Loading champion data...'}
                      value={championQuery}
                    />
                  </div>
                </div>
                <button
                  className="rounded-2xl bg-cyan-300 px-5 py-4 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
                  onClick={() => {
                    if (filteredChampions[0]) onChampionSelect(filteredChampions[0].id);
                  }}
                  type="button"
                >
                  Open Detail
                </button>
              </div>
              {filteredChampions.length > 0 ? (
                <div className="mt-3 grid gap-2">
                  {filteredChampions.map((champion) => (
                    <button
                      key={champion.id}
                      className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm text-slate-200 transition hover:border-cyan-300/30 hover:bg-white/10"
                      onClick={() => onChampionSelect(champion.id)}
                      type="button"
                    >
                      <span>{champion.name}</span>
                      <span className="text-xs uppercase tracking-[0.2em] text-slate-500">{champion.tags?.[0] ?? 'Champ'}</span>
                    </button>
                  ))}
                </div>
              ) : null}
              <div className="mt-4 flex flex-wrap gap-2">
              {['Faker#KR1', 'Jinx', 'Ahri', 'Riven', 'Darius'].map((query) => (
                <button
                  key={query}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300 transition hover:border-cyan-300/30 hover:text-white"
                  onClick={() => {
                    if (query.includes('#')) {
                      onProfileQuickLookup(query);
                    } else {
                      onChampionQueryChange(query);
                      onChampionSelect(query);
                    }
                  }}
                  type="button"
                >
                  {query}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {trustStats.map((stat) => (
              <article key={stat.value} className="rounded-[24px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
                <p className="text-3xl font-semibold text-white">{stat.value}</p>
                <p className="mt-2 text-sm leading-6 text-slate-400">{stat.label}</p>
              </article>
            ))}
          </div>
        </div>

        <aside className="space-y-5">
          <section className="rounded-[30px] border border-cyan-300/20 bg-slate-950/60 p-6 shadow-[0_20px_90px_rgba(10,18,36,0.5)] backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-cyan-200">Smart profile</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">Your 10-second player read</h2>
              </div>
              <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-3">
                <Brain className="h-5 w-5 text-cyan-200" />
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {smartInsights.map((insight) => (
                <div key={insight} className="flex gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <Check className="mt-0.5 h-4 w-4 text-emerald-300" />
                  <p className="text-sm leading-6 text-slate-200">{insight}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-[24px] border border-emerald-300/20 bg-emerald-300/10 p-5">
              <div className="flex items-center justify-between text-sm text-emerald-100">
                <span>Rank-up momentum</span>
                <span>2 wins to Gold</span>
              </div>
              <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/10">
                <div className="h-full w-4/5 rounded-full bg-gradient-to-r from-emerald-300 via-cyan-300 to-sky-400" />
              </div>
              <p className="mt-3 text-sm text-emerald-50/90">Consistency rises when the player enters each game with a visible checklist.</p>
            </div>
          </section>

          <section className="rounded-[30px] border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-6 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-indigo-300/20 bg-indigo-300/10 p-3">
                <Zap className="h-5 w-5 text-indigo-200" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-indigo-200">Monetization with proof</p>
                <h3 className="text-xl font-semibold text-white">AI Coach Premium</h3>
              </div>
            </div>
            <ul className="mt-5 space-y-3">
              {premiumFeatures.map((feature) => (
                <li key={feature} className="flex items-start gap-3 text-sm text-slate-200">
                  <Check className="mt-0.5 h-4 w-4 text-cyan-200" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6 flex items-end justify-between rounded-[24px] border border-amber-300/20 bg-amber-300/10 p-5">
              <div>
                <p className="text-sm text-amber-100">7-day free trial</p>
                <p className="mt-1 text-3xl font-semibold text-white">
                  $9.99<span className="text-base text-slate-300">/mo</span>
                </p>
              </div>
              <button className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:scale-[1.02]" type="button">
                Unlock Plus
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </section>
        </aside>
      </section>
    </div>
  );
}

type PageRenderProps = {
  navigateToPage: (page: ProductPageId) => void;
  selectedChampion: WebChampionSummary | null;
  championMeta: (typeof championSupplemental)[keyof typeof championSupplemental];
  selectedBuild: (typeof buildGuides)[number];
  selectedMatchups: typeof matchupGuides;
  championDirectory: WebChampionDirectory | null;
  profileQuery: string;
  setProfileQuery: (value: string) => void;
  profileResult: WebRiotProfile | null;
  profileStatus: 'idle' | 'loading' | 'error' | 'success';
  profileMessage: string;
  onProfileLookup: () => void;
  onChampionSelect: (championId: string) => void;
};

function renderActivePage(activePage: ProductPageId, props: PageRenderProps) {
  switch (activePage) {
    case 'overview':
      return <OverviewPage navigateToPage={props.navigateToPage} />;
    case 'profile':
      return <ProfilePage {...props} />;
    case 'builds':
      return <BuildsPage {...props} />;
    case 'counters':
      return <CountersPage {...props} />;
    case 'patch-radar':
      return <PatchRadarPage />;
    case 'premium':
      return <PremiumPage />;
    default:
      return <OverviewPage navigateToPage={props.navigateToPage} />;
  }
}

function OverviewPage({ navigateToPage }: { navigateToPage: (page: ProductPageId) => void }) {
  return (
    <>
      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="grid gap-6">
          <div className="panel-card">
            <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="section-kicker">Dashboard AI</p>
                <h2 className="section-title">Turn loose data into moves that actually raise elo</h2>
              </div>
              <p className="max-w-2xl text-sm leading-7 text-slate-400">
                Instead of only showing picks and winrates, the platform interprets patterns, identifies repeated errors
                and builds a plan by role, phase and competitive objective.
              </p>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {dashboardCards.map(({ icon: Icon, title, body }) => (
                <article key={title} className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-slate-950/80">
                    <Icon className="h-5 w-5 text-cyan-200" />
                  </div>
                  <h4 className="mt-4 text-lg font-semibold text-white">{title}</h4>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{body}</p>
                </article>
              ))}
            </div>

            <div className="mt-6 rounded-[26px] border border-white/10 bg-slate-950/70 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-slate-400">Winrate trend</p>
                  <p className="text-2xl font-semibold text-white">58% this week</p>
                </div>
                <p className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-emerald-100">
                  +7% versus last cycle
                </p>
              </div>
              <div className="mt-6 grid h-44 grid-cols-7 items-end gap-3">
                {[38, 46, 42, 58, 64, 60, 72].map((height, index) => (
                  <div key={height + index} className="flex h-full flex-col justify-end gap-2">
                    <div
                      className="rounded-t-[18px] bg-gradient-to-t from-cyan-400 via-sky-300 to-indigo-300 shadow-[0_0_24px_rgba(56,189,248,0.28)]"
                      style={{ height: `${height}%` }}
                    />
                    <span className="text-center text-xs text-slate-500">D{index + 1}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="panel-card">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-fuchsia-200">Why it wins</p>
                <h3 className="mt-2 text-2xl font-semibold text-white">Better than OP.GG, U.GG or Mobafire where it matters</h3>
              </div>
              <p className="max-w-xl text-sm leading-7 text-slate-400">
                The advantage is not more tables. It is context, urgency and personalization pushing the next action.
              </p>
            </div>

            <div className="mt-6 overflow-hidden rounded-[24px] border border-white/10">
              <div className="grid grid-cols-[0.95fr_1fr_1.15fr] bg-white/5 text-sm text-slate-300">
                <div className="px-4 py-3">Category</div>
                <div className="border-l border-white/10 px-4 py-3">Competitors</div>
                  <div className="border-l border-white/10 px-4 py-3">TrackerStat.gg</div>
              </div>
              {comparisonRows.map(([label, oldWay, newWay]) => (
                <div key={label} className="grid grid-cols-[0.95fr_1fr_1.15fr] border-t border-white/10 text-sm">
                  <div className="px-4 py-4 text-white">{label}</div>
                  <div className="border-l border-white/10 px-4 py-4 text-slate-400">{oldWay}</div>
                  <div className="border-l border-white/10 px-4 py-4 text-cyan-100">{newWay}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-6">
          <div className="panel-card">
            <p className="text-xs uppercase tracking-[0.24em] text-amber-200">Live match AI assistant</p>
            <h3 className="mt-2 text-2xl font-semibold text-white">Suggestions during the match</h3>
            <div className="mt-6 space-y-4">
              {liveAssistant.map((item) => (
                <article key={item.time} className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-white">{item.title}</p>
                    <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs text-cyan-100">
                      {item.time}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-400">{item.body}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="panel-card">
            <p className="text-xs uppercase tracking-[0.24em] text-emerald-200">Gamification</p>
            <h3 className="mt-2 text-2xl font-semibold text-white">Missions that build retention habits</h3>
            <div className="mt-6 space-y-3">
              {missions.map((mission, index) => (
                <div key={mission} className="flex items-center justify-between rounded-[22px] border border-white/10 bg-white/5 px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-slate-950/70 text-sm text-cyan-100">
                      {index + 1}
                    </div>
                    <span className="text-sm text-slate-200">{mission}</span>
                  </div>
                  <Shield className="h-4 w-4 text-emerald-300" />
                </div>
              ))}
            </div>
          </div>

          <div className="panel-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-cyan-200">Next clicks</p>
                <h3 className="mt-2 text-2xl font-semibold text-white">Internal pages already mapped</h3>
              </div>
              <Eye className="h-5 w-5 text-cyan-200" />
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                ['Profile AI', 'profile'],
                ['Build Lab', 'builds'],
                ['Counter Lab', 'counters'],
                ['Patch Radar', 'patch-radar'],
              ].map(([label, page]) => (
                <button
                  key={label}
                  className="rounded-[22px] border border-white/10 bg-white/5 px-4 py-4 text-left text-sm text-slate-200 transition hover:border-cyan-300/30 hover:bg-white/10"
                  onClick={() => navigateToPage(page as ProductPageId)}
                  type="button"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="panel-card">
          <p className="section-kicker">Emotional hooks</p>
          <h2 className="section-title">Retention comes from progress, identity and feedback</h2>
          <div className="mt-6 space-y-4">
            {[
              'Ranking milestones such as "2 wins to rank up"',
              'Player identity tags like macro player, lane bully or closer',
              'Recurring mistake diary with celebration moments',
              'Social challenges for duo, team or direct rival comparison',
            ].map((item) => (
              <div key={item} className="flex gap-3 rounded-[22px] border border-white/10 bg-white/5 p-4">
                <Swords className="mt-0.5 h-4 w-4 text-fuchsia-200" />
                <p className="text-sm leading-6 text-slate-300">{item}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="panel-card">
          <p className="section-kicker">Actionable content</p>
          <h2 className="section-title">Replace passive news with repeat-use surfaces</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {[
              'Patch radar that explains why the meta changed and who can exploit it.',
              'Counter lab that compares patterns, not only picks.',
              'Clip review to find the exact mechanical or macro error.',
              'Enemy scouting for ranked sessions, scrims or amateur tournaments.',
            ].map((item) => (
              <article key={item} className="rounded-[24px] border border-white/10 bg-slate-950/65 p-5">
                <p className="text-sm leading-7 text-slate-300">{item}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function ProfilePage({
  profileQuery,
  setProfileQuery,
  profileResult,
  profileStatus,
  profileMessage,
  onProfileLookup,
}: Pick<PageRenderProps, 'profileQuery' | 'setProfileQuery' | 'profileResult' | 'profileStatus' | 'profileMessage' | 'onProfileLookup'>) {
  return (
    <section className="panel-card">
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="section-kicker">Profile AI</p>
          <h2 className="section-title">Player identity, weaknesses and psychological hooks</h2>
        </div>
        <p className="max-w-2xl text-sm leading-7 text-slate-400">
          This page should feel like a smart coach report, not a sterile profile page. It tells the player who they are,
          where they throw games and what the next growth loop should be.
        </p>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="grid gap-6">
          <article className="rounded-[26px] border border-white/10 bg-white/5 p-6">
            <p className="text-sm text-slate-400">Live Riot profile lookup</p>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <input
                className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
                onChange={(event) => setProfileQuery(event.target.value)}
                placeholder="gameName#tagLine"
                value={profileQuery}
              />
              <button
                className="rounded-2xl bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
                onClick={onProfileLookup}
                type="button"
              >
                {profileStatus === 'loading' ? 'Loading...' : 'Lookup'}
              </button>
            </div>
            <p className={`mt-3 text-sm ${profileStatus === 'error' ? 'text-rose-300' : 'text-slate-400'}`}>{profileMessage}</p>
          </article>

          <article className="rounded-[26px] border border-white/10 bg-white/5 p-6">
            <p className="text-sm text-slate-400">Style tag</p>
            <p className="mt-2 text-3xl font-semibold text-white">Aggressive Macro Climber</p>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              You create leads well, but your conversion rate falls after lane because your recalls and objective setups
              drift too late.
            </p>
          </article>

          <article className="rounded-[26px] border border-white/10 bg-white/5 p-6">
            <p className="text-sm text-slate-400">Top recurring mistakes</p>
            <div className="mt-4 space-y-3">
              {[
                'Overstaying after first turret',
                'Late warding before first river contest',
                'Taking low-value fights without objective pressure',
              ].map((item) => (
                <div key={item} className="rounded-[18px] border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-200">
                  {item}
                </div>
              ))}
            </div>
          </article>
        </div>

        <div className="grid gap-6">
          {profileResult ? (
            <article className="rounded-[26px] border border-cyan-300/20 bg-cyan-300/10 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.22em] text-cyan-100">Live Riot data</p>
                  <p className="mt-2 text-2xl font-semibold text-white">
                    {profileResult.gameName}#{profileResult.tagLine}
                  </p>
                </div>
                <div className="text-right text-sm text-slate-100">
                  <p>Level {profileResult.summonerLevel}</p>
                  <p className="text-slate-300">Icon {profileResult.profileIconId}</p>
                </div>
              </div>
              <div className="mt-5 grid gap-3">
                {profileResult.ranks.length > 0 ? (
                  profileResult.ranks.map((rank) => (
                    <div key={rank.queueType} className="rounded-[18px] border border-white/10 bg-slate-950/40 p-4 text-sm text-slate-100">
                      <p className="font-semibold">{formatQueue(rank.queueType)}</p>
                      <p className="mt-1 text-slate-300">
                        {rank.tier} {rank.rank} · {rank.leaguePoints} LP · {rank.wins}W/{rank.losses}L
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="rounded-[18px] border border-white/10 bg-slate-950/40 p-4 text-sm text-slate-100">
                    No ranked entries were returned for this profile.
                  </div>
                )}
              </div>
            </article>
          ) : null}

          <article className="rounded-[26px] border border-cyan-300/20 bg-cyan-300/10 p-6">
            <p className="text-sm uppercase tracking-[0.22em] text-cyan-100">Coaching summary</p>
            <div className="mt-4 space-y-3">
              {smartInsights.map((insight) => (
                <div key={insight} className="flex gap-3 rounded-[18px] border border-white/10 bg-slate-950/40 p-4">
                  <Check className="mt-0.5 h-4 w-4 text-emerald-300" />
                  <p className="text-sm leading-6 text-slate-100">{insight}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-[26px] border border-white/10 bg-white/5 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Rank-up pressure</p>
                <p className="mt-2 text-2xl font-semibold text-white">2 wins to Gold</p>
              </div>
              <Users className="h-5 w-5 text-cyan-200" />
            </div>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-4/5 rounded-full bg-gradient-to-r from-emerald-300 via-cyan-300 to-sky-400" />
            </div>
            <p className="mt-4 text-sm leading-7 text-slate-400">
              Showing meaningful progress is stronger than a generic profile badge. This is where daily re-engagement starts.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}

function BuildsPage({
  selectedChampion,
  championMeta,
  selectedBuild,
  championDirectory,
  onChampionSelect,
}: Pick<PageRenderProps, 'selectedChampion' | 'championMeta' | 'selectedBuild' | 'championDirectory' | 'onChampionSelect'>) {
  return (
    <section className="panel-card">
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="section-kicker">Build Lab</p>
          <h2 className="section-title">Builds, runes and item paths that react to context</h2>
        </div>
        <p className="max-w-2xl text-sm leading-7 text-slate-400">
          Competitors stop at pickrate. This surface should answer what to build now, why, and what enemy pattern it solves.
        </p>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <article className="rounded-[28px] border border-white/10 bg-white/5 p-6">
          <div className="flex items-center gap-4">
            {selectedChampion && championDirectory ? (
              <img
                alt={selectedChampion.name}
                className="h-20 w-20 rounded-2xl object-cover"
                src={getChampionImageUrl(championDirectory.patch, selectedChampion.imageFull)}
              />
            ) : null}
            <div>
              <p className="text-sm text-slate-400">Selected champion</p>
              <h3 className="mt-1 text-3xl font-semibold text-white">
                {selectedChampion?.name ?? selectedBuild.championId}
              </h3>
              <p className="mt-1 text-sm text-cyan-100">{championMeta.style}</p>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {(championDirectory?.champions.filter((champion) => championSupplemental[champion.id]).slice(0, 6) ?? []).map((champion) => (
              <button
                key={champion.id}
                className="rounded-full border border-white/10 bg-slate-950/60 px-3 py-2 text-xs text-slate-200 transition hover:border-cyan-300/30"
                onClick={() => onChampionSelect(champion.id)}
                type="button"
              >
                {champion.name}
              </button>
            ))}
          </div>
          <div className="mt-6 grid gap-3">
            <div className="rounded-[18px] border border-white/10 bg-slate-950/60 p-4 text-sm text-slate-300">
              <span className="text-slate-500">Roles:</span> {championMeta.roles.join(' / ')}
            </div>
            <div className="rounded-[18px] border border-white/10 bg-slate-950/60 p-4 text-sm text-slate-300">
              <span className="text-slate-500">Difficulty:</span> {championMeta.difficulty}
            </div>
            <div className="rounded-[18px] border border-white/10 bg-slate-950/60 p-4 text-sm text-slate-300">
              <span className="text-slate-500">Keystone:</span> {selectedBuild.keystone}
            </div>
            <div className="rounded-[18px] border border-white/10 bg-slate-950/60 p-4 text-sm text-slate-300">
              <span className="text-slate-500">Summoners:</span> {selectedBuild.summoners.join(' / ')}
            </div>
            <div className="rounded-[18px] border border-white/10 bg-slate-950/60 p-4 text-sm text-slate-300">
              <span className="text-slate-500">Boots:</span> {selectedBuild.boots}
            </div>
          </div>
        </article>

        <article className="rounded-[28px] border border-white/10 bg-white/5 p-6">
          <p className="text-sm uppercase tracking-[0.22em] text-slate-400">Structured build detail</p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-[22px] border border-white/10 bg-slate-950/60 p-5">
              <p className="text-sm text-slate-400">Starter</p>
              <p className="mt-3 text-sm leading-7 text-white">{selectedBuild.starterItems.join(' · ')}</p>
            </div>
            <div className="rounded-[22px] border border-white/10 bg-slate-950/60 p-5">
              <p className="text-sm text-slate-400">Core</p>
              <p className="mt-3 text-sm leading-7 text-white">{selectedBuild.coreItems.join(' → ')}</p>
            </div>
            <div className="rounded-[22px] border border-white/10 bg-slate-950/60 p-5 md:col-span-2">
              <p className="text-sm text-slate-400">Situational</p>
              <p className="mt-3 text-sm leading-7 text-white">{selectedBuild.situationalItems.join(' · ')}</p>
            </div>
          </div>
          <div className="mt-5 space-y-3">
            {selectedBuild.tips.map((tip) => (
              <div key={tip} className="flex gap-3 rounded-[18px] border border-white/10 bg-slate-950/40 p-4 text-sm text-slate-200">
                <Check className="mt-0.5 h-4 w-4 text-cyan-200" />
                <span>{tip}</span>
              </div>
            ))}
          </div>
        </article>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <article className="rounded-[24px] border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-slate-400">Strengths</p>
          <div className="mt-3 space-y-2 text-sm text-white">
            {championMeta.strengths.map((item) => (
              <p key={item}>{item}</p>
            ))}
          </div>
        </article>
        <article className="rounded-[24px] border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-slate-400">Weaknesses</p>
          <div className="mt-3 space-y-2 text-sm text-white">
            {championMeta.weaknesses.map((item) => (
              <p key={item}>{item}</p>
            ))}
          </div>
        </article>
        <article className="rounded-[24px] border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-slate-400">Coaching focus</p>
          <div className="mt-3 space-y-2 text-sm text-white">
            {championMeta.coachingFocus.map((item) => (
              <p key={item}>{item}</p>
            ))}
          </div>
        </article>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {[
          'Adaptive build cards by matchup and enemy damage profile.',
          'Purchase timing timeline with minute-based urgency.',
          'Explainability layer so users understand the recommendation.',
        ].map((item) => (
          <article key={item} className="rounded-[24px] border border-white/10 bg-white/5 p-5 text-sm leading-7 text-slate-300">
            {item}
          </article>
        ))}
      </div>
    </section>
  );
}

function CountersPage({
  selectedChampion,
  championMeta,
  selectedMatchups,
}: Pick<PageRenderProps, 'selectedChampion' | 'championMeta' | 'selectedMatchups'>) {
  return (
    <section className="panel-card">
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="section-kicker">Counter Lab</p>
          <h2 className="section-title">Counters by pattern, lane state and player tendency</h2>
        </div>
        <p className="max-w-2xl text-sm leading-7 text-slate-400">
          This should be one of the biggest traffic engines: searchable matchups, counters, weaknesses and punishment plans.
        </p>
      </div>

      <div className="mt-8 rounded-[26px] border border-cyan-300/20 bg-cyan-300/10 p-6">
        <p className="text-sm uppercase tracking-[0.22em] text-cyan-100">
          Matchups for {selectedChampion?.name ?? championMeta.id}
        </p>
        <p className="mt-3 text-sm leading-7 text-slate-100">
          {championMeta.id} thrives as a {championMeta.style.toLowerCase()}. These detail cards show how the matchup page can become a real SEO and retention surface.
        </p>
      </div>

      <div className="mt-6 grid gap-4">
        {selectedMatchups.map((row) => (
          <article key={row.id} className="rounded-[26px] border border-white/10 bg-white/5 p-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <h3 className="text-xl font-semibold text-white">
                {row.championId} vs {row.enemyId}
              </h3>
              <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-cyan-100">
                {row.dangerWindow}
              </span>
            </div>
            <p className="mt-3 text-sm leading-7 text-slate-400">{row.edgeSummary}</p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="rounded-[18px] border border-white/10 bg-slate-950/60 p-4">
                <p className="text-sm text-slate-400">Win condition</p>
                <p className="mt-2 text-sm leading-7 text-white">{row.winCondition}</p>
              </div>
              <div className="rounded-[18px] border border-white/10 bg-slate-950/60 p-4">
                <p className="text-sm text-slate-400">Avoid</p>
                <ul className="mt-2 space-y-2 text-sm text-white">
                  {row.avoidList.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="mt-4 rounded-[18px] border border-emerald-300/20 bg-emerald-300/10 p-4">
              <p className="text-sm text-emerald-50">Punish windows: {row.punishList.join(' · ')}</p>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {[
          'Counter surfaces should compare champions, items, runes and tempo windows.',
          'Great SEO layer: every matchup can become a smart landing page with dynamic recommendations.',
        ].map((item) => (
          <article key={item} className="rounded-[24px] border border-white/10 bg-slate-950/65 p-5 text-sm leading-7 text-slate-300">
            {item}
          </article>
        ))}
      </div>
    </section>
  );
}

function PatchRadarPage() {
  return (
    <section className="panel-card">
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="section-kicker">Patch Radar</p>
          <h2 className="section-title">Explain the meta instead of only summarizing patch notes</h2>
        </div>
        <p className="max-w-2xl text-sm leading-7 text-slate-400">
          Users do not need more passive news cards. They need a page that tells them what changed, why, who benefits and
          what they should abuse right now.
        </p>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {patchCards.map((card) => (
          <article key={card.title} className="rounded-[26px] border border-white/10 bg-white/5 p-6">
            <p className="text-lg font-semibold text-white">{card.title}</p>
            <p className="mt-3 text-sm leading-7 text-slate-400">{card.body}</p>
          </article>
        ))}
      </div>

      <div className="mt-6 rounded-[28px] border border-amber-300/20 bg-amber-300/10 p-6">
        <p className="text-xs uppercase tracking-[0.22em] text-amber-100">Traffic plus retention opportunity</p>
        <p className="mt-3 text-base leading-8 text-slate-100">
          Patch Radar should feed social content, push notifications, homepage modules and re-engagement emails. It can be
          one of the strongest recurring reasons to visit.
        </p>
      </div>
    </section>
  );
}

function PremiumPage() {
  return (
    <section className="panel-card">
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="section-kicker">Premium</p>
          <h2 className="section-title">Monetization should feel earned, visible and useful</h2>
        </div>
        <p className="max-w-2xl text-sm leading-7 text-slate-400">
          Strong monetization comes from proving live value first, then upgrading the user into deeper analysis and guidance.
        </p>
      </div>

      <div className="mt-8 grid gap-4 xl:grid-cols-3">
        {pricingCards.map((plan, index) => (
          <article
            key={plan.name}
            className={`rounded-[28px] border p-6 ${
              index === 1
                ? 'border-cyan-300/30 bg-cyan-300/10 shadow-[0_0_40px_rgba(34,211,238,0.12)]'
                : 'border-white/10 bg-white/5'
            }`}
          >
            <p className="text-sm uppercase tracking-[0.22em] text-slate-300">{plan.name}</p>
            <p className="mt-3 text-4xl font-semibold text-white">
              {plan.price}
              {plan.name !== 'Free' ? <span className="text-base text-slate-300">/mo</span> : null}
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-400">{plan.description}</p>
            <div className="mt-5 space-y-3">
              {plan.features.map((feature) => (
                <div key={feature} className="flex items-start gap-3 text-sm text-slate-200">
                  <Check className="mt-0.5 h-4 w-4 text-cyan-200" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
            <button
              className={`mt-6 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                index === 1 ? 'bg-white text-slate-950 hover:scale-[1.02]' : 'border border-white/10 bg-white/5 text-white hover:bg-white/10'
              }`}
              type="button"
            >
              Choose {plan.name}
              <ArrowRight className="h-4 w-4" />
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

export default App;

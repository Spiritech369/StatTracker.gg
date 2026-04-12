import { createBrowserRouter } from 'react-router-dom';
import OverviewPage from '../pages/lol/OverviewPage';
import BuildsPage from '../pages/lol/BuildsPage';
import CountersPage from '../pages/lol/CountersPage';
import PatchRadarPage from '../pages/lol/PatchRadarPage';
import ProfilePage from '../pages/profiles/ProfilePage';
import PremiumPage from '../pages/billing/PremiumPage';

export const router = createBrowserRouter([
  { path: '/', element: <OverviewPage /> },
  { path: '/lol', element: <OverviewPage /> },
  { path: '/lol/builds', element: <BuildsPage /> },
  { path: '/lol/counters', element: <CountersPage /> },
  { path: '/lol/patch-radar', element: <PatchRadarPage /> },
  { path: '/profiles', element: <ProfilePage /> },
  { path: '/premium', element: <PremiumPage /> },
]);

export type ChampionSupplemental = {
  id: string;
  title: string;
  roles: string[];
  style: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  strengths: string[];
  weaknesses: string[];
  coachingFocus: string[];
};

export type BuildGuide = {
  championId: string;
  lane: string;
  patchTag: string;
  keystone: string;
  summoners: string[];
  coreItems: string[];
  starterItems: string[];
  situationalItems: string[];
  boots: string;
  tips: string[];
};

export type MatchupGuide = {
  id: string;
  championId: string;
  enemyId: string;
  lane: string;
  dangerWindow: string;
  edgeSummary: string;
  winCondition: string;
  avoidList: string[];
  punishList: string[];
};

export const championSupplemental: Record<string, ChampionSupplemental> = {
  Jinx: {
    id: 'Jinx',
    title: 'the Loose Cannon',
    roles: ['ADC'],
    style: 'Scaling teamfight hypercarry',
    difficulty: 'Medium',
    strengths: ['Late-game DPS', 'Objective burn', 'Front-to-back fights'],
    weaknesses: ['Low mobility', 'Punishable lane phase', 'Needs protection'],
    coachingFocus: ['Respect poke lanes levels 1-5', 'Reset on item spike before dragon', 'Play max range once passive procs'],
  },
  Ahri: {
    id: 'Ahri',
    title: 'the Nine-Tailed Fox',
    roles: ['Mid'],
    style: 'Tempo mage and pick creator',
    difficulty: 'Medium',
    strengths: ['Mid-game tempo', 'Roam pressure', 'Pick setup'],
    weaknesses: ['Falls off if behind', 'Missed charm loses pressure', 'Can overforce side picks'],
    coachingFocus: ['Use push windows to move first', 'Hold charm for certainty, not vanity', 'Crash then hover objectives'],
  },
  Riven: {
    id: 'Riven',
    title: 'the Exile',
    roles: ['Top'],
    style: 'Snowball skirmisher',
    difficulty: 'Hard',
    strengths: ['Short trades', 'All-in pressure', 'Side lane threat'],
    weaknesses: ['Execution heavy', 'Falls off without tempo', 'Weak when behind into armor'],
    coachingFocus: ['Trade around cooldowns not ego', 'Stack waves before forcing', 'Use lead to break map, not only lane'],
  },
  Darius: {
    id: 'Darius',
    title: 'the Hand of Noxus',
    roles: ['Top'],
    style: 'Lane bully juggernaut',
    difficulty: 'Easy',
    strengths: ['Lane control', 'Extended fights', 'Punishes melee mistakes'],
    weaknesses: ['Kitable in teamfights', 'Predictable engage', 'Can be abandoned by tempo'],
    coachingFocus: ['Thin waves before ghost all-in', 'Play for plate tempo', 'Do not overchase after first kill'],
  },
};

export const buildGuides: BuildGuide[] = [
  {
    championId: 'Jinx',
    lane: 'ADC',
    patchTag: 'Data Dragon + AI layer',
    keystone: 'Lethal Tempo',
    summoners: ['Flash', 'Cleanse'],
    starterItems: ['Doran Blade', 'Health Potion'],
    coreItems: ['Kraken Slayer', 'Infinity Edge', 'Lord Dominik’s Regards'],
    situationalItems: ['Guardian Angel', 'Maw of Malmortius', 'Bloodthirster'],
    boots: 'Berserker’s Greaves',
    tips: ['Swap to rockets for front line reach', 'Respect first reset windows', 'Do not frontload traps before engage starts'],
  },
  {
    championId: 'Ahri',
    lane: 'Mid',
    patchTag: 'Data Dragon + AI layer',
    keystone: 'Electrocute',
    summoners: ['Flash', 'Teleport'],
    starterItems: ['Doran Ring', 'Health Potion'],
    coreItems: ['Luden’s Companion', 'Shadowflame', 'Zhonya’s Hourglass'],
    situationalItems: ['Banshee’s Veil', 'Rabadon’s Deathcap', 'Morellonomicon'],
    boots: 'Sorcerer’s Shoes',
    tips: ['Charm after movement bait, not before', 'Crash waves before roam', 'Play fog around second objective'],
  },
  {
    championId: 'Riven',
    lane: 'Top',
    patchTag: 'Data Dragon + AI layer',
    keystone: 'Conqueror',
    summoners: ['Flash', 'Teleport'],
    starterItems: ['Doran Blade', 'Health Potion'],
    coreItems: ['Eclipse', 'Sundered Sky', 'Black Cleaver'],
    situationalItems: ['Maw of Malmortius', 'Death’s Dance', 'Guardian Angel'],
    boots: 'Ionian Boots of Lucidity',
    tips: ['Use brush to break vision before combo', 'Keep wave on your side against jungle threat', 'Push advantage into herald timer'],
  },
];

export const matchupGuides: MatchupGuide[] = [
  {
    id: 'Jinx-Caitlyn',
    championId: 'Jinx',
    enemyId: 'Caitlyn',
    lane: 'ADC',
    dangerWindow: 'Levels 1-5 and first reset',
    edgeSummary: 'Jinx loses raw lane pressure but wins if she preserves HP and reaches two items cleanly.',
    winCondition: 'Survive poke, hold wave near tower, then play front-to-back around first major teamfight.',
    avoidList: ['Blind trading into stacked wave', 'Using chompers before engage starts', 'Greedy plates without vision'],
    punishList: ['Recall after cannon crash', 'Fight once support CC lands', 'Abuse passive reset in extended skirmishes'],
  },
  {
    id: 'Ahri-Lissandra',
    championId: 'Ahri',
    enemyId: 'Lissandra',
    lane: 'Mid',
    dangerWindow: 'Level 6 roam and counter-engage timings',
    edgeSummary: 'Ahri owns tempo before hard commits. Lissandra punishes obvious charm angles and low-discipline roams.',
    winCondition: 'Push first, move with vision, and keep ultimate for reposition instead of raw engage.',
    avoidList: ['Dash-forward ego charms', 'Roaming on uncrashed waves', 'Fighting without side river control'],
    punishList: ['Trade on cooldown windows', 'Hover side lanes before dragon', 'Punish failed claw positioning'],
  },
  {
    id: 'Riven-Renekton',
    championId: 'Riven',
    enemyId: 'Renekton',
    lane: 'Top',
    dangerWindow: 'Early fury trades and jungle synchronized dives',
    edgeSummary: 'Riven can outscale lane influence if she dodges first fury windows and fights with cooldown advantage.',
    winCondition: 'Short trade, reset, stack wave, then threaten all-in once armor and fury state are favorable.',
    avoidList: ['Trading into fury plus wave disadvantage', 'Burning shield early', 'Forcing after enemy jungle disappears'],
    punishList: ['Fight when fury is low', 'Hold third Q for disengage or finisher', 'Crash stacked waves into roam timers'],
  },
];

export type ChampionSummary = {
  id: string;
  name: string;
  imageFull: string;
  title?: string;
  tags?: string[];
};

export type ChampionDirectoryResponse = {
  patch: string;
  champions: ChampionSummary[];
  generatedAt?: string;
};

export type RiotRankEntry = {
  queueType: string;
  tier: string;
  rank: string;
  leaguePoints: number;
  wins: number;
  losses: number;
};

export type RiotProfileResponse = {
  puuid?: string;
  gameName: string;
  tagLine: string;
  summonerLevel: number;
  profileIconId: number;
  ranks: RiotRankEntry[];
};

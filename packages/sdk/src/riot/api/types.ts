import { z } from 'zod'

export const REGIONAL_ROUTES = ['americas', 'europe', 'asia', 'sea'] as const
export type RegionalRoute = (typeof REGIONAL_ROUTES)[number]

export const PLATFORM_ROUTES = [
  'br1',
  'eun1',
  'euw1',
  'jp1',
  'kr',
  'la1',
  'la2',
  'na1',
  'oc1',
  'tr1',
  'ru',
  'ph2',
  'sg2',
  'th2',
  'tw2',
  'vn2',
] as const
export type PlatformRoute = (typeof PLATFORM_ROUTES)[number]

// ─── account-v1 ───────────────────────────

export const AccountDtoSchema = z.object({
  puuid: z.string(),
  gameName: z.string().optional(),
  tagLine: z.string().optional(),
})
export type AccountDto = z.infer<typeof AccountDtoSchema>

// ─── match-v5 ─────────────────────────────

export const MatchIdListSchema = z.array(z.string())

export const ParticipantDtoSchema = z
  .object({
    puuid: z.string(),
    summonerName: z.string().optional(),
    riotIdGameName: z.string().optional(),
    riotIdTagline: z.string().optional(),
    championId: z.number(),
    championName: z.string(),
    teamId: z.number(),
    win: z.boolean(),
    kills: z.number(),
    deaths: z.number(),
    assists: z.number(),
    teamPosition: z.string().optional(),
    individualPosition: z.string().optional(),
    lane: z.string().optional(),
    role: z.string().optional(),
  })
  .passthrough()
export type ParticipantDto = z.infer<typeof ParticipantDtoSchema>

export const MatchInfoSchema = z
  .object({
    gameId: z.number(),
    gameMode: z.string(),
    gameType: z.string(),
    gameVersion: z.string(),
    gameDuration: z.number(),
    gameStartTimestamp: z.number(),
    gameEndTimestamp: z.number().optional(),
    queueId: z.number(),
    mapId: z.number(),
    participants: z.array(ParticipantDtoSchema),
  })
  .passthrough()

export const MatchMetadataSchema = z.object({
  matchId: z.string(),
  dataVersion: z.string(),
  participants: z.array(z.string()),
})

export const MatchDtoSchema = z.object({
  metadata: MatchMetadataSchema,
  info: MatchInfoSchema,
})
export type MatchDto = z.infer<typeof MatchDtoSchema>

export interface MatchIdsOptions {
  start?: number
  count?: number
  queue?: number
  type?: 'ranked' | 'normal' | 'tourney' | 'tutorial'
  startTime?: number
  endTime?: number
}

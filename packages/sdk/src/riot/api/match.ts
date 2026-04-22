import type { RiotHttpClient } from './client.js'
import { MatchDtoSchema, MatchIdListSchema, type MatchIdsOptions } from './types.js'

export function createMatchApi(http: RiotHttpClient) {
  return {
    idsByPuuid: (puuid: string, opts: MatchIdsOptions = {}) => {
      const qs = new URLSearchParams()
      if (opts.start !== undefined) qs.set('start', String(opts.start))
      if (opts.count !== undefined) qs.set('count', String(opts.count))
      if (opts.queue !== undefined) qs.set('queue', String(opts.queue))
      if (opts.type) qs.set('type', opts.type)
      if (opts.startTime !== undefined) qs.set('startTime', String(opts.startTime))
      if (opts.endTime !== undefined) qs.set('endTime', String(opts.endTime))
      const query = qs.toString()
      return http.get(
        'regional',
        `/lol/match/v5/matches/by-puuid/${puuid}/ids${query ? `?${query}` : ''}`,
        MatchIdListSchema,
      )
    },
    byId: (matchId: string) =>
      http.get('regional', `/lol/match/v5/matches/${matchId}`, MatchDtoSchema),
  }
}

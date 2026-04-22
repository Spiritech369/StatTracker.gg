import type { RiotHttpClient } from './client.js'
import { AccountDtoSchema } from './types.js'

export function createAccountApi(http: RiotHttpClient) {
  return {
    byRiotId: (gameName: string, tagLine: string) =>
      http.get(
        'regional',
        `/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`,
        AccountDtoSchema,
      ),
    byPuuid: (puuid: string) =>
      http.get('regional', `/riot/account/v1/accounts/by-puuid/${puuid}`, AccountDtoSchema),
  }
}

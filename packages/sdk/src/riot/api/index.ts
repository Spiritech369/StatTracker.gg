import { createAccountApi } from './account.js'
import { createRiotHttpClient, type RiotClientOptions } from './client.js'
import { createMatchApi } from './match.js'

export type { RiotClientOptions, RiotHttpClient } from './client.js'
export { createRiotHttpClient, RiotApiError } from './client.js'
export * from './types.js'

export function createRiotClient(opts: RiotClientOptions) {
  const http = createRiotHttpClient(opts)
  return {
    http,
    account: createAccountApi(http),
    match: createMatchApi(http),
  }
}

export type RiotClient = ReturnType<typeof createRiotClient>

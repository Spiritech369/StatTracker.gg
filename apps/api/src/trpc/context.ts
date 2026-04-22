import { prisma } from '@trackerstat/database'
import type { CreateFastifyContextOptions } from '@trpc/server/adapters/fastify'

export function createContext({ req, res }: CreateFastifyContextOptions) {
  return {
    req,
    res,
    prisma,
    userId: null as string | null,
  }
}

export type Context = ReturnType<typeof createContext>

import { publicProcedure, router } from '../trpc/trpc.js'

export const healthRouter = router({
  ping: publicProcedure.query(() => ({
    status: 'ok' as const,
    timestamp: Date.now(),
  })),
})

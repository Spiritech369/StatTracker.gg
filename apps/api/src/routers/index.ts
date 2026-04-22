import { router } from '../trpc/trpc.js'
import { healthRouter } from './health.js'
import { lolRouter } from './lol.js'
import { userRouter } from './user.js'

export const appRouter = router({
  health: healthRouter,
  lol: lolRouter,
  user: userRouter,
})

export type AppRouter = typeof appRouter

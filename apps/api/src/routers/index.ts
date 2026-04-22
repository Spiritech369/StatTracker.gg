import { router } from '../trpc/trpc.js'
import { healthRouter } from './health.js'
import { userRouter } from './user.js'

export const appRouter = router({
  health: healthRouter,
  user: userRouter,
})

export type AppRouter = typeof appRouter

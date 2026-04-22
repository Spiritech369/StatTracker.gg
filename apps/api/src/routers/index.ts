import { router } from '../trpc/trpc.js'
import { healthRouter } from './health.js'
import { lolRouter } from './lol.js'
import { tftRouter } from './tft.js'
import { userRouter } from './user.js'

export const appRouter = router({
  health: healthRouter,
  lol: lolRouter,
  tft: tftRouter,
  user: userRouter,
})

export type AppRouter = typeof appRouter

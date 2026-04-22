import { TRPCError } from '@trpc/server'
import { authedProcedure, router } from '../trpc/trpc.js'

export const userRouter = router({
  me: authedProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: { id: ctx.userId },
      include: { riotAccounts: true },
    })
    if (!user) throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' })
    return user
  }),
})

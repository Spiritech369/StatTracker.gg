import cors from '@fastify/cors'
import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify'
import Fastify from 'fastify'
import { env } from './env.js'
import { appRouter } from './routers/index.js'
import { createContext } from './trpc/context.js'

async function main() {
  const app = Fastify({
    logger: {
      level: env.API_LOG_LEVEL,
      transport:
        env.NODE_ENV === 'development'
          ? { target: 'pino-pretty', options: { colorize: true, translateTime: 'SYS:HH:MM:ss' } }
          : undefined,
    },
  })

  await app.register(cors, {
    origin: env.API_CORS_ORIGIN.split(',').map((s) => s.trim()),
    credentials: true,
  })

  app.get('/health', async () => ({ status: 'ok', uptime: process.uptime() }))

  await app.register(fastifyTRPCPlugin, {
    prefix: '/trpc',
    trpcOptions: {
      router: appRouter,
      createContext,
      onError({ path, error }: { path: string | undefined; error: Error }) {
        app.log.error({ path, err: error }, 'tRPC error')
      },
    },
  })

  try {
    await app.listen({ host: env.API_HOST, port: env.API_PORT })
    app.log.info(`API ready at http://${env.API_HOST}:${env.API_PORT}`)
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

main().catch((err) => {
  console.error('Fatal startup error:', err)
  process.exit(1)
})

export type { AppRouter } from './routers/index.js'

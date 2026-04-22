import { z } from 'zod'

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  API_HOST: z.string().default('0.0.0.0'),
  API_PORT: z.coerce.number().int().default(4000),
  API_LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  API_CORS_ORIGIN: z.string().default('http://localhost:3000'),
  DATABASE_URL: z.string().url().optional(),
  REDIS_URL: z.string().url().optional(),
  AUTH_SECRET: z.string().optional(),
  RIOT_API_KEY: z.string().optional(),
  RIOT_REGIONAL: z.enum(['americas', 'europe', 'asia', 'sea']).default('americas'),
})

export const env = schema.parse(process.env)
export type Env = z.infer<typeof schema>

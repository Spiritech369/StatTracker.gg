import { prisma } from '@trackerstat/database'
import type { CreateFastifyContextOptions } from '@trpc/server/adapters/fastify'
import { decode } from 'next-auth/jwt'

const SESSION_COOKIE_NAMES = ['authjs.session-token', '__Secure-authjs.session-token']

async function resolveUserId(cookies: Record<string, string | undefined>): Promise<string | null> {
  const secret = process.env.AUTH_SECRET
  if (!secret) return null

  for (const name of SESSION_COOKIE_NAMES) {
    const token = cookies[name]
    if (!token) continue
    try {
      const decoded = await decode({ token, secret, salt: name })
      if (decoded?.sub) return decoded.sub
    } catch {
      // invalid or expired — continue
    }
  }
  return null
}

function parseCookieHeader(header: string | undefined): Record<string, string> {
  if (!header) return {}
  const out: Record<string, string> = {}
  for (const part of header.split(';')) {
    const [k, ...v] = part.trim().split('=')
    if (k) out[k] = decodeURIComponent(v.join('='))
  }
  return out
}

export async function createContext({ req, res }: CreateFastifyContextOptions) {
  const cookies = parseCookieHeader(req.headers.cookie)
  const userId = await resolveUserId(cookies)
  return { req, res, prisma, userId }
}

export type Context = Awaited<ReturnType<typeof createContext>>

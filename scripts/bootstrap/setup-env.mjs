#!/usr/bin/env node
// Idempotente: crea .env raíz y apps/web/.env si no existen,
// rellena AUTH_SECRET si sigue vacío.

import { randomBytes } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(__dirname, '..', '..')
const rootEnv = resolve(repoRoot, '.env')
const rootEnvExample = resolve(repoRoot, '.env.example')
const webEnv = resolve(repoRoot, 'apps', 'web', '.env')

function generateSecret() {
  return randomBytes(32).toString('base64')
}

function ensureRootEnv() {
  if (existsSync(rootEnv)) {
    const content = readFileSync(rootEnv, 'utf8')
    if (/^AUTH_SECRET=\s*$/m.test(content)) {
      const filled = content.replace(/^AUTH_SECRET=\s*$/m, `AUTH_SECRET=${generateSecret()}`)
      writeFileSync(rootEnv, filled)
      console.log('[bootstrap] .env existente: AUTH_SECRET generado')
    } else {
      console.log('[bootstrap] .env ya existe, nada que hacer')
    }
    return
  }
  if (!existsSync(rootEnvExample)) {
    throw new Error(`no se encontró .env.example en ${rootEnvExample}`)
  }
  const template = readFileSync(rootEnvExample, 'utf8')
  const filled = template.replace(/^AUTH_SECRET=\s*$/m, `AUTH_SECRET=${generateSecret()}`)
  writeFileSync(rootEnv, filled)
  console.log('[bootstrap] .env creado desde .env.example')
}

function ensureWebEnv() {
  // apps/web/.env: Next.js lo carga desde su propio cwd.
  // Duplicamos las vars que la web necesita para evitar runtime surprises.
  const rootContent = readFileSync(rootEnv, 'utf8')
  const needed = [
    'DATABASE_URL',
    'NEXT_PUBLIC_API_URL',
    'AUTH_SECRET',
    'AUTH_URL',
    'AUTH_TRUST_HOST',
    'AUTH_DISCORD_ID',
    'AUTH_DISCORD_SECRET',
  ]
  const lines = []
  for (const key of needed) {
    const match = rootContent.match(new RegExp(`^${key}=(.*)$`, 'm'))
    if (match) lines.push(`${key}=${match[1]}`)
  }
  const shouldWrite = !existsSync(webEnv) || !readFileSync(webEnv, 'utf8').includes('AUTH_SECRET=')
  if (shouldWrite) {
    writeFileSync(webEnv, `${lines.join('\n')}\n`)
    console.log('[bootstrap] apps/web/.env sincronizado desde .env raíz')
  } else {
    console.log('[bootstrap] apps/web/.env ya OK')
  }
}

try {
  ensureRootEnv()
  ensureWebEnv()
  console.log('[bootstrap] OK')
} catch (err) {
  console.error('[bootstrap] FALLO:', err.message)
  process.exit(1)
}

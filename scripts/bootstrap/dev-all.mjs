#!/usr/bin/env node
// Arranca el entorno de desarrollo completo:
// 1. bootstrap .env
// 2. asegura Docker corriendo (Postgres + Redis)
// 3. db:generate + db:push
// 4. levanta API y Web en paralelo con prefijo por stream

import { exec, spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { platform } from 'node:os'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'

const execAsync = promisify(exec)
const __dirname = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(__dirname, '..', '..')
const isWindows = platform() === 'win32'

const color = {
  api: '\x1b[36m', // cyan
  web: '\x1b[32m', // green
  sys: '\x1b[33m', // yellow
  err: '\x1b[31m', // red
  off: '\x1b[0m',
}

function log(tag, msg) {
  const c = color[tag] ?? color.sys
  process.stdout.write(`${c}[${tag}]${color.off} ${msg}\n`)
}

async function runQuiet(cmd) {
  try {
    const { stdout } = await execAsync(cmd, { cwd: repoRoot })
    return stdout.trim()
  } catch (err) {
    return null
  }
}

async function ensureDocker() {
  // Probe: docker info returns 0 if daemon OK.
  const info = await runQuiet('docker info')
  if (info !== null) {
    log('sys', 'Docker daemon OK')
    return
  }

  log('sys', 'Docker no responde — intentando abrir Docker Desktop')
  if (isWindows) {
    const candidates = [
      'C:\\Program Files\\Docker\\Docker\\Docker Desktop.exe',
      `${process.env.LOCALAPPDATA}\\Docker\\Docker\\Docker Desktop.exe`,
    ]
    const exe = candidates.find((p) => p && existsSync(p))
    if (!exe) {
      log(
        'err',
        'Docker Desktop no encontrado. Instálalo desde https://docker.com/products/docker-desktop',
      )
      process.exit(1)
    }
    spawn(exe, [], { detached: true, stdio: 'ignore' }).unref()
  } else {
    await runQuiet('open -a Docker')
  }

  // Espera hasta 60s a que el daemon responda
  for (let i = 0; i < 60; i++) {
    await new Promise((r) => setTimeout(r, 1000))
    if ((await runQuiet('docker info')) !== null) {
      log('sys', `Docker daemon listo (tardó ${i + 1}s)`)
      return
    }
  }
  log('err', 'Docker Desktop tardó más de 60s en arrancar. Ábrelo manualmente y reintenta.')
  process.exit(1)
}

async function ensureComposeUp() {
  log('sys', 'docker compose up -d')
  const { stdout, stderr } = await execAsync('docker compose up -d', { cwd: repoRoot })
  if (stdout) process.stdout.write(stdout)
  if (stderr) process.stderr.write(stderr)
}

async function waitForPostgres() {
  log('sys', 'Esperando Postgres (pg_isready)...')
  for (let i = 0; i < 30; i++) {
    const res = await runQuiet(
      'docker compose exec -T postgres pg_isready -U trackerstat -d trackerstat',
    )
    if (res && res.includes('accepting connections')) {
      log('sys', `Postgres listo (${i + 1}s)`)
      return
    }
    await new Promise((r) => setTimeout(r, 1000))
  }
  log('err', 'Postgres no respondió en 30s')
  process.exit(1)
}

async function dbSync() {
  log('sys', 'pnpm db:generate + db:push')
  await execAsync('pnpm db:generate', { cwd: repoRoot })
  await execAsync('pnpm db:push', { cwd: repoRoot })
  log('sys', 'Schema sincronizado')
}

function spawnPrefixed(tag, cmd, args) {
  const child = spawn(cmd, args, {
    cwd: repoRoot,
    shell: isWindows,
    env: { ...process.env, FORCE_COLOR: '1' },
  })
  const pipe = (stream, target) => {
    let buf = ''
    stream.on('data', (chunk) => {
      buf += chunk.toString()
      const lines = buf.split('\n')
      buf = lines.pop() ?? ''
      for (const line of lines) target.write(`${color[tag]}[${tag}]${color.off} ${line}\n`)
    })
  }
  pipe(child.stdout, process.stdout)
  pipe(child.stderr, process.stderr)
  child.on('exit', (code) => log('sys', `${tag} salió con código ${code}`))
  return child
}

async function main() {
  log('sys', 'Bootstrap env')
  await execAsync('node scripts/bootstrap/setup-env.mjs', { cwd: repoRoot })

  await ensureDocker()
  await ensureComposeUp()
  await waitForPostgres()
  await dbSync()

  log('sys', 'Arrancando API (:4000) y Web (:3000)')
  const api = spawnPrefixed('api', 'pnpm', ['dev:api'])
  const web = spawnPrefixed('web', 'pnpm', ['dev:web'])

  const shutdown = () => {
    log('sys', 'Cerrando procesos...')
    api.kill()
    web.kill()
    process.exit(0)
  }
  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)
}

main().catch((err) => {
  log('err', err.message)
  process.exit(1)
})

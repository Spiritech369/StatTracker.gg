import { prisma } from '@trackerstat/database'
import { ingestLolDataDragon } from './jobs/ingest-lol-data-dragon.js'
import { ingestTftDataDragon } from './jobs/ingest-tft-data-dragon.js'
import { log } from './shared/log.js'

const JOBS = {
  'lol-data-dragon': ingestLolDataDragon,
  'tft-data-dragon': ingestTftDataDragon,
} as const

type JobName = keyof typeof JOBS

async function main() {
  const name = process.argv[2] as JobName | undefined

  if (!name || !(name in JOBS)) {
    log.error('unknown job', new Error(`usage: workers <${Object.keys(JOBS).join('|')}>`))
    process.exit(1)
  }

  try {
    const result = await JOBS[name]()
    log.info('job complete', { ...result })
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((err) => {
  log.error('job failed', err)
  process.exit(1)
})

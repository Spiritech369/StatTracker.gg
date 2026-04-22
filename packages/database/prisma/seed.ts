import {
  getChampions,
  getLatestVersion,
  getLoLRole,
  patchLabelFromVersion,
} from '@trackerstat/sdk/riot'
import { prisma } from '../src/index.js'

function seededRandom(seed: number) {
  const x = Math.sin(seed * 9301 + 49297) * 49297
  return x - Math.floor(x)
}

function tierFromScore(score: number): string {
  if (score >= 54.5) return 'S'
  if (score >= 52.5) return 'A'
  if (score >= 50) return 'B'
  return 'C'
}

async function seedLoL() {
  const version = await getLatestVersion()
  const patch = patchLabelFromVersion(version)
  const file = await getChampions(version)
  const champions = Object.values(file.data)
  const dayFactor = Math.floor(Date.now() / 86_400_000)

  console.log(`[seed] LoL patch ${patch} — ${champions.length} champions`)

  for (const c of champions) {
    const seed = Number.parseInt(c.key, 10) + dayFactor * 7
    const role = getLoLRole(c.id, c.tags)
    const winrate = Number(
      (
        48.5 +
        seededRandom(seed) * 5.5 +
        (c.info.difficulty > 7 ? 1.2 : c.info.difficulty > 4 ? 0.5 : 0)
      ).toFixed(1),
    )
    const pickrate = Math.max(
      Number(
        (
          2 +
          seededRandom(seed + 100) * 12 +
          (c.info.attack > 7 ? 2 : c.info.magic > 7 ? 1.5 : 0)
        ).toFixed(1),
      ),
      0.5,
    )
    const banrate = Math.min(Number((seededRandom(seed + 200) * 10).toFixed(1)), 15)
    const tier = tierFromScore(winrate + pickrate * 0.08 + (10 - banrate) * 0.05)

    await prisma.championStat.upsert({
      where: {
        game_patch_championKey_role: { game: 'LOL', patch, championKey: c.id, role },
      },
      update: { winrate, pickrate, banrate, tier, computedAt: new Date() },
      create: {
        game: 'LOL',
        patch,
        championKey: c.id,
        role,
        winrate,
        pickrate,
        banrate,
        tier,
      },
    })
  }

  console.log(`[seed] done`)
}

seedLoL()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

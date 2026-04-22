import { z } from 'zod'

const DDRAGON_BASE = 'https://ddragon.leagueoflegends.com'

const ChampionInfoSchema = z.object({
  attack: z.number(),
  defense: z.number(),
  magic: z.number(),
  difficulty: z.number(),
})

const ChampionSchema = z.object({
  id: z.string(),
  key: z.string(),
  name: z.string(),
  title: z.string(),
  tags: z.array(z.string()),
  info: ChampionInfoSchema,
})

const ChampionFileSchema = z.object({
  version: z.string(),
  data: z.record(z.string(), ChampionSchema),
})

export type DDragonChampion = z.infer<typeof ChampionSchema>
export type DDragonChampionFile = z.infer<typeof ChampionFileSchema>

async function ddragonFetch<T>(
  path: string,
  schema: z.ZodType<T>,
  revalidate?: number,
): Promise<T> {
  const init: RequestInit & { next?: { revalidate: number } } = {}
  if (revalidate !== undefined) init.next = { revalidate }
  const res = await fetch(`${DDRAGON_BASE}${path}`, init)
  if (!res.ok) throw new Error(`Data Dragon ${path} failed: ${res.status}`)
  return schema.parse(await res.json())
}

export async function getVersions(revalidate = 3600): Promise<string[]> {
  return ddragonFetch('/api/versions.json', z.array(z.string()), revalidate)
}

export async function getLatestVersion(): Promise<string> {
  const versions = await getVersions()
  const v = versions[0]
  if (!v) throw new Error('Data Dragon returned empty versions list')
  return v
}

export async function getChampions(
  version: string,
  locale = 'en_US',
  revalidate = 300,
): Promise<DDragonChampionFile> {
  return ddragonFetch(
    `/cdn/${version}/data/${locale}/champion.json`,
    ChampionFileSchema,
    revalidate,
  )
}

const TftUnitSchema = z
  .object({
    apiName: z.string(),
    name: z.string(),
    cost: z.number(),
    traits: z.array(z.string()).default([]),
  })
  .passthrough()

const TftChampionFileSchema = z.object({
  version: z.string(),
  data: z.record(z.string(), TftUnitSchema),
})

export type DDragonTftUnit = z.infer<typeof TftUnitSchema>
export type DDragonTftChampionFile = z.infer<typeof TftChampionFileSchema>

export async function getTftChampions(
  version: string,
  locale = 'en_US',
  revalidate = 300,
): Promise<DDragonTftChampionFile> {
  return ddragonFetch(
    `/cdn/${version}/data/${locale}/tft-champion.json`,
    TftChampionFileSchema,
    revalidate,
  )
}

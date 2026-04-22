export const log = {
  info: (msg: string, meta?: Record<string, unknown>) => {
    console.log(`[workers] ${msg}`, meta ?? '')
  },
  warn: (msg: string, meta?: Record<string, unknown>) => {
    console.warn(`[workers] ${msg}`, meta ?? '')
  },
  error: (msg: string, err: unknown) => {
    console.error(`[workers] ${msg}`, err)
  },
}

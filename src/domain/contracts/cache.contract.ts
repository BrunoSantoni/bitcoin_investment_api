export type FindOnCacheByKeyInput = {
  key: string
}

export type FindOnCacheByKeyOutput<T extends string> = {
  [key in T]: string
} | null

export interface FindOnCacheByKey {
  findByKey<T extends string>(input: FindOnCacheByKeyInput): Promise<FindOnCacheByKeyOutput<T>>
}

export type SaveOnCacheInput = {
  key: string
  value: string
}

export interface SaveOnCache {
  save(input: SaveOnCacheInput): Promise<void>
}

export type CacheAdapterInput = {
  cacheClientUrl: string
}

export type CacheAdapter = {
  isReady: boolean
  on: (key: string, callback: never) => void
  get: (key: string) => Promise<string | null>
  set: (key: string, value: string, options?: object) => Promise<string | null>
  connect: () => Promise<CacheAdapter>
  disconnect: () => Promise<void>
}

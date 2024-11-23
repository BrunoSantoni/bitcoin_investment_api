import { createClient, RedisClientType } from 'redis'
import {
  CacheAdapter,
  CacheAdapterInput,
  FindOnCacheByKey,
  FindOnCacheByKeyInput,
  FindOnCacheByKeyOutput,
  SaveOnCache,
  SaveOnCacheInput,
} from '@/domain/contracts/cache.contract'

export class RedisCache implements CacheAdapter, FindOnCacheByKey, SaveOnCache {
  private static instance: RedisCache

  private cacheClient: RedisClientType

  private MAX_RETRIES = 5

  private RETRY_DELAY = 10000

  private readonly EXPIRATION_IN_SECONDS = 1800

  private REDIS_CACHE_PREFIX = 'bitcoin-investment-api'

  constructor(
    private readonly cacheClientUrl: string,
  ) {
    this.cacheClient = this.createCacheClient()
  }

  static instantiate(input: CacheAdapterInput): RedisCache {
    if (
      !RedisCache.instance
      || !RedisCache.instance.cacheClient.isReady
    ) {
      RedisCache.instance = new RedisCache(
        input.cacheClientUrl,
      )
    }

    return RedisCache.instance
  }

  async connect() {
    const isReady = this.cacheClient.isReady
    if (!isReady) await this.cacheClient.connect()
  }

  async disconnect() {
    const isReady = this.cacheClient.isReady
    if (isReady) await this.cacheClient.disconnect()
  }

  async findByKey<T extends string>(input: FindOnCacheByKeyInput): Promise<FindOnCacheByKeyOutput<T>> {
    const { key } = input
    const valueInCache = await this.cacheClient.get(
      `${this.REDIS_CACHE_PREFIX}:${key}`,
    )

    return valueInCache !== null
      ? {
          [key as T]: valueInCache,
        } as FindOnCacheByKeyOutput<T>
      : null
  }

  async save(input: SaveOnCacheInput): Promise<void> {
    const { key, value } = input
    await this.cacheClient.set(
      `${this.REDIS_CACHE_PREFIX}:${key}`,
      value,
      {
        EX: this.EXPIRATION_IN_SECONDS,
        NX: true,
      },
    )
  }

  reconnectStrategy(retries: number) {
    if (retries > this.MAX_RETRIES) {
      console.error(
        `[RedisCache.reconnectStrategy]: Max retries reached - ${retries}`,
      )
      return false
    }
    console.log(
      `[RedisCache.reconnectStrategy]: Retrying to establish new connection - ${retries}`,
    )
    return this.RETRY_DELAY
  }

  private createCacheClient(): RedisClientType {
    return createClient({
      url: this.cacheClientUrl,
      socket: {
        reconnectStrategy: this.reconnectStrategy,
      },
    })
  }
}

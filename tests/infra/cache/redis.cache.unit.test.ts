import redis from 'redis'
import { beforeAll, beforeEach, describe, expect, it, Mock, vi } from 'vitest'
import { RedisCache } from '@/infra/cache/redis.cache'

vi.mock('redis')

describe('Redis Cache', () => {
  let sut: RedisCache
  let fakeCacheClientUrl: string
  let mockCreateClient: Mock
  let mockGet: Mock
  let mockSet: Mock
  let mockConnect: Mock
  let mockDisconnect: Mock

  beforeAll(() => {
    fakeCacheClientUrl = 'cache://any-url'
    mockGet = vi.fn().mockResolvedValue('any-value')
    mockSet = vi.fn()
    mockConnect = vi.fn()
    mockDisconnect = vi.fn()

    mockCreateClient = vi.mocked(redis.createClient).mockImplementation(() => ({
      isReady: true,
      on: vi.fn(),
      get: mockGet,
      set: mockSet,
      connect: mockConnect,
      disconnect: mockDisconnect,
    }) as never)
  })

  beforeEach(() => {
    vi.clearAllMocks()

    sut = new RedisCache(fakeCacheClientUrl)
  })

  describe('findByKey', () => {
    it('should call cacheClient.get with correct string', async () => {
      await sut.findByKey<'any-value'>({
        key: 'any-key',
      })

      expect(mockGet).toHaveBeenCalledWith('bitcoin-investment-api:any-key')
      expect(mockGet).toHaveBeenCalledTimes(1)
    })

    it('should return null when cacheClient.get returns null', async () => {
      mockGet.mockResolvedValueOnce(null)

      const output = await sut.findByKey<'any-value'>({
        key: 'any-key',
      })

      expect(output).toBe(null)
    })

    it('should return key and value in object on success', async () => {
      const output = await sut.findByKey<'any-value'>({
        key: 'any-key',
      })

      expect(output).toEqual({
        'any-key': 'any-value',
      })
    })
  })

  describe('save', () => {
    it('should call cacheClient.set with correct params', async () => {
      await sut.save({
        key: 'any-key',
        value: '{"property": "any-property"}',
      })

      expect(mockSet).toHaveBeenCalledWith(
        'bitcoin-investment-api:any-key',
        '{"property": "any-property"}',
        {
          EX: 1800,
          NX: true,
        },
      )
      expect(mockSet).toHaveBeenCalledTimes(1)
    })
  })

  describe('instantiate', () => {
    it('should be able to instantiate just one repository', () => {
      const instance = RedisCache.instantiate({
        cacheClientUrl: fakeCacheClientUrl,
      })
      const instance2 = RedisCache.instantiate({
        cacheClientUrl: fakeCacheClientUrl,
      })

      expect(instance).toBeInstanceOf(RedisCache)
      expect(instance).toBe(instance2)
    })
  })

  describe('reconnectStrategy', () => {
    it.each([1, 3, 5])(
      'should return RETRY_DELAY when retry count is less or equal than 5',
      async (retries) => {
        const output = sut.reconnectStrategy(retries)

        expect(output).toBe(10000)
      },
    )

    it('should return false when retry count is greater than 5', async () => {
      const output = sut.reconnectStrategy(6)

      expect(output).toBe(false)
    })
  })

  describe('connect', () => {
    it('should call connect if cacheClient is not ready', async () => {
      mockCreateClient.mockImplementationOnce(() => ({
        isReady: false,
        on: vi.fn(),
        get: mockGet,
        set: mockSet,
        connect: mockConnect,
        disconnect: mockDisconnect,
      }) as never)

      const sut = new RedisCache(fakeCacheClientUrl)

      await sut.connect()
      expect(mockConnect).toHaveBeenCalledTimes(1)
    })

    it('should not call connect if cacheClient is ready', async () => {
      await sut.connect()
      expect(mockConnect).not.toHaveBeenCalled()
    })
  })

  describe('disconnect', () => {
    it('should call disconnect if cacheClient is ready', async () => {
      await sut.disconnect()
      expect(mockDisconnect).toHaveBeenCalled()
    })

    it('should not call disconnect if cacheClient is not ready', async () => {
      mockCreateClient.mockImplementationOnce(() => ({
        isReady: false,
        on: vi.fn(),
        get: mockGet,
        set: mockSet,
        connect: mockConnect,
        disconnect: mockDisconnect,
      }) as never)

      const sut = new RedisCache(fakeCacheClientUrl)

      await sut.disconnect()
      expect(mockDisconnect).not.toHaveBeenCalled()
    })
  })
})

import { beforeAll, beforeEach, describe, expect, it, Mocked, vi } from 'vitest'
import { BTCPriceService } from '@/domain/services/btc-price.service'
import { FindOnCacheByKey } from '@/domain/contracts/cache.contract'
import { ObtainCurrentBTCPrice } from '@/domain/contracts/btc-actions.contract'
import { SendToQueue } from '@/domain/contracts/queue.contract'

describe('BTC Price Service', () => {
  let sut: BTCPriceService
  let fakeFindOnCacheByKeyRepository: Mocked<FindOnCacheByKey>
  let fakeObtainCurrentBTCPrice: Mocked<ObtainCurrentBTCPrice>
  let fakeSendBTCCurrentPriceToQueue: Mocked<SendToQueue>
  let fakeCacheSaverQueueName: string

  beforeAll(() => {
    fakeFindOnCacheByKeyRepository = {
      findByKey: vi.fn().mockResolvedValue(null),
    }
    fakeObtainCurrentBTCPrice = {
      obtainCurrentPrice: vi.fn().mockResolvedValue({
        purchasePrice: 537963.391,
        salePrice: 539677.66989998,
      }),
    }
    fakeSendBTCCurrentPriceToQueue = {
      sendToQueue: vi.fn(),
    }
    fakeCacheSaverQueueName = 'any-queue-name'
  })

  beforeEach(() => {
    vi.clearAllMocks()

    sut = new BTCPriceService(
      fakeFindOnCacheByKeyRepository,
      fakeObtainCurrentBTCPrice,
      fakeSendBTCCurrentPriceToQueue,
      fakeCacheSaverQueueName,
    )
  })

  it('should call findOnCacheByKeyRepository.findByKey with cache key', async () => {
    await sut.handle()

    expect(fakeFindOnCacheByKeyRepository.findByKey).toHaveBeenCalledWith({
      key: 'btc-price',
    })
    expect(fakeFindOnCacheByKeyRepository.findByKey).toHaveBeenCalledTimes(1)
  })

  it('should rethrow when findOnCacheByKeyRepository.findByKey throws', async () => {
    fakeFindOnCacheByKeyRepository.findByKey.mockRejectedValueOnce(new Error('any-error'))

    const promise = sut.handle()

    expect(() => promise).rejects.toThrow()
  })

  it('should return price found on cache using toFixed(2)', async () => {
    fakeFindOnCacheByKeyRepository.findByKey.mockResolvedValueOnce({
      'btc-price': '{"key":"btc-price","purchasePrice":537963.39,"salePrice":539677.66989998}',
    })

    const output = await sut.handle()

    expect(output).toEqual(
      {
        success: true,
        data: {
          purchasePrice: 537963.39,
          salePrice: 539677.67,
        },
      },
    )
  })

  it('should call obtainCurrentBTCPrice.obtainCurrentPrice without params when price is not found on cache', async () => {
    await sut.handle()

    expect(fakeObtainCurrentBTCPrice.obtainCurrentPrice).toHaveBeenCalledWith()
    expect(fakeObtainCurrentBTCPrice.obtainCurrentPrice).toHaveBeenCalledTimes(1)
  })

  it('should rethrow when obtainCurrentBTCPrice.obtainCurrentPrice throws', async () => {
    fakeObtainCurrentBTCPrice.obtainCurrentPrice.mockRejectedValueOnce(new Error('any-error'))

    const promise = sut.handle()

    expect(() => promise).rejects.toThrow()
  })

  it('should call sendBTCCurrentPriceToQueue.sendToQueue with queue name and received price from the api when price is not found on cache', async () => {
    await sut.handle()

    expect(fakeSendBTCCurrentPriceToQueue.sendToQueue).toHaveBeenCalledWith({
      queueName: 'any-queue-name',
      message: '{"key":"btc-price","purchasePrice":537963.391,"salePrice":539677.66989998}',
    })
    expect(fakeSendBTCCurrentPriceToQueue.sendToQueue).toHaveBeenCalledTimes(1)
  })

  it('should rethrow when sendBTCCurrentPriceToQueue.sendToQueue throws', async () => {
    fakeSendBTCCurrentPriceToQueue.sendToQueue.mockRejectedValueOnce(new Error('any-error'))

    const promise = sut.handle()

    expect(() => promise).rejects.toThrow()
  })

  it('should return price received from the API with toFixed(2) when not found on cache', async () => {
    const output = await sut.handle()

    expect(output).toEqual(
      {
        success: true,
        data: {
          purchasePrice: 537963.39,
          salePrice: 539677.67,
        },
      },
    )
  })
})

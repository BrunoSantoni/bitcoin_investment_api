import { BTCPrice, BTCPriceOutput } from '@/domain/contracts/btc-price.contract'
import { FindOnCacheByKey } from '@/domain/contracts/cache.contract'
import { SendToQueue } from '@/domain/contracts/queue.contract'
import { ObtainCurrentBTCPrice } from '@/domain/contracts/btc-actions.contract'

export class BTCPriceService implements BTCPrice {
  private readonly CACHE_KEY = 'btc-price'

  constructor(
    private readonly findOnCacheByKeyRepository: FindOnCacheByKey,
    private readonly obtainCurrentBTCPrice: ObtainCurrentBTCPrice,
    private readonly sendBTCCurrentPriceToQueue: SendToQueue,
    private readonly cacheSaverQueueName: string,
  ) {
  }

  async handle(): Promise<BTCPriceOutput> {
    const priceOnCache = await this.findOnCacheByKeyRepository.findByKey<'btc-price'> ({
      key: this.CACHE_KEY,
    })

    if (priceOnCache !== null) {
      console.log('[BTCPriceService]: Obtained BTC prices from cache')
      const parsedPriceOnCache: { purchasePrice: number, salePrice: number } = JSON.parse(priceOnCache['btc-price'])

      return {
        success: true,
        data: {
          purchasePrice: Number(parsedPriceOnCache.purchasePrice.toFixed(2)),
          salePrice: Number(parsedPriceOnCache.salePrice.toFixed(2)),
        },
      }
    }

    const currentBTCPrice = await this.obtainCurrentBTCPrice.obtainCurrentPrice()

    await this.sendBTCCurrentPriceToQueue.sendToQueue({
      queueName: this.cacheSaverQueueName,
      message: JSON.stringify({
        key: this.CACHE_KEY,
        purchasePrice: currentBTCPrice.purchasePrice,
        salePrice: currentBTCPrice.salePrice,
      }),
    })

    console.log('[BTCPriceService]: Obtained BTC prices from API', currentBTCPrice.purchasePrice, currentBTCPrice.salePrice)

    return {
      success: true,
      data: {
        purchasePrice: Number(currentBTCPrice.purchasePrice.toFixed(2)),
        salePrice: Number(currentBTCPrice.salePrice.toFixed(2)),
      },
    }
  }
}

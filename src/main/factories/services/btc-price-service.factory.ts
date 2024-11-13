import { BTCPrice } from '@/domain/contracts/btc-price.contract'
import { BTCPriceService } from '@/domain/services/btc-price.service'
import { SendToQueue } from '@/domain/contracts/queue.contract'
import { FindOnCacheByKey } from '@/domain/contracts/cache.contract'
import { BTCApi } from '@/infra/apis/btc.api'
import { env } from '@/main/config/env'

export const makeBTCPriceService = (cacheInstance: FindOnCacheByKey, queueInstance: SendToQueue): BTCPrice => {
  const btcApi = new BTCApi(env.bitcoinPriceBaseApiUrl)

  return new BTCPriceService(cacheInstance, btcApi, queueInstance, env.cacheSaverQueueName)
}

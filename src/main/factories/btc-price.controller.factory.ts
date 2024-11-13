import { BaseController } from '@/application/controllers/base.controller'
import { BTCPriceController, BTCPriceControllerInput } from '@/application/controllers/btc-price.controller'
import { makeBTCPriceService } from '@/main/factories/services/btc-price-service.factory'
import { FindOnCacheByKey } from '@/domain/contracts/cache.contract'
import { SendToQueue } from '@/domain/contracts/queue.contract'

export const makeBTCPriceController = (cacheInstance: FindOnCacheByKey, queueInstance: SendToQueue): BaseController<BTCPriceControllerInput> => {
  const btcPriceService = makeBTCPriceService(cacheInstance, queueInstance)
  return new BTCPriceController(btcPriceService)
}

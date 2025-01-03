import { BaseController } from '@/application/controllers/base.controller'
import { HttpResponse } from '@/application/contracts/http.contract'
import { badRequest, ok } from '@/application/presenters/http.presenter'
import { BTCPrice } from '@/domain/contracts/btc-price.contract'
import { Validator } from '@/application/contracts/validator.contract'

export type BTCPriceControllerInput = {
  userId: string
}

export class BTCPriceController extends BaseController<BTCPriceControllerInput> {
  name = 'BTCPriceController'

  constructor(
    private readonly btcPriceService: BTCPrice,
    private readonly validator: Validator<BTCPriceControllerInput>,
  ) {
    super()
  }

  protected async perform(): Promise<HttpResponse> {
    const response = await this.btcPriceService.handle()

    if (!response.success) {
      return badRequest(typeof response?.data?.message === 'string' ? response.data.message : 'Error when trying to obtain BTC price')
    }

    return ok({
      ...response.data,
    })
  }

  protected validate(payload: BTCPriceControllerInput): void {
    this.validator.validate(payload)
  }
}

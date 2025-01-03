import { BaseController } from '@/application/controllers/base.controller'
import { HttpResponse } from '@/application/contracts/http.contract'
import { badRequest, ok } from '@/application/presenters/http.presenter'
import { Validator } from '@/application/contracts/validator.contract'
import { UserBalance } from '@/domain/contracts/user-balance.contract'

export type BalanceControllerInput = {
  userId: string
}

export class BalanceController extends BaseController<BalanceControllerInput> {
  name = 'BalanceController'

  constructor(
    private readonly userBalanceService: UserBalance,
    private readonly validator: Validator<BalanceControllerInput>,
  ) {
    super()
  }

  protected async perform(payload: BalanceControllerInput): Promise<HttpResponse> {
    const { userId } = payload
    const response = await this.userBalanceService.handle({ userId })

    if (!response.success) {
      return badRequest(typeof response?.data?.message === 'string' ? response.data.message : 'Cannot create balance')
    }

    return ok({
      ...response.data,
    })
  }

  protected validate(payload: BalanceControllerInput): void {
    this.validator.validate(payload)
  }
}

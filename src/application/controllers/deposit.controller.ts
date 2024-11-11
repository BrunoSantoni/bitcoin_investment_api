import { BaseController } from '@/application/controllers/base.controller'
import { HttpResponse } from '@/application/contracts/http.contract'
import { badRequest, noContent } from '@/application/presenters/http.presenter'
import { Validator } from '@/application/contracts/validator.contract'
import { UserDeposit } from '@/domain/contracts/user-deposit.contract'

export type DepositControllerInput = {
  amount: number
  userId: string
}

export class DepositController extends BaseController<DepositControllerInput> {
  name = 'DepositController'

  constructor(
    private readonly userDepositService: UserDeposit,
    private readonly validator: Validator<DepositControllerInput>,
  ) {
    super()
  }

  protected async perform(payload: DepositControllerInput): Promise<HttpResponse> {
    const { amount, userId } = payload
    const response = await this.userDepositService.handle({
      amount,
      userId,
    })

    if (!response.success) {
      return badRequest(typeof response?.data?.message === 'string' ? response.data.message : 'Cannot create deposit')
    }

    return noContent()
  }

  protected validate(payload: DepositControllerInput): void {
    this.validator.validate(payload)
  }
}

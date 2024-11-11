import { BaseController } from '@/application/controllers/base.controller'
import { DepositController, DepositControllerInput } from '@/application/controllers/deposit.controller'
import { makeUserDepositService } from '@/main/factories/services/user-deposit-service.factory'
import { DepositControllerZodValidation } from '@/validation/deposit-controller-zod.validation'

export const makeDepositController = (): BaseController<DepositControllerInput> => {
  const userDepositService = makeUserDepositService()
  const validator = new DepositControllerZodValidation()
  return new DepositController(userDepositService, validator)
}

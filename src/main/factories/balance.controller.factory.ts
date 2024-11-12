import { BaseController } from '@/application/controllers/base.controller'
import { BalanceController, BalanceControllerInput } from '@/application/controllers/balance.controller'
import { BalanceControllerZodValidation } from '@/validation/balance-controller-zod.validation'
import { makeUserBalanceService } from '@/main/factories/services/user-balance-service.factory'

export const makeBalanceController = (): BaseController<BalanceControllerInput> => {
  const userBalanceService = makeUserBalanceService()
  const validator = new BalanceControllerZodValidation()
  return new BalanceController(userBalanceService, validator)
}

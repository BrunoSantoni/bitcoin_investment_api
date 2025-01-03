import { z } from 'zod'
import { BaseZodValidation } from '@/validation/base-zod.validation'
import { BalanceControllerInput } from '@/application/controllers/balance.controller'

export class BalanceControllerZodValidation extends BaseZodValidation<BalanceControllerInput> {
  protected schema = z.object({
    userId: z.string({ message: 'Missing information' }),
  })
}

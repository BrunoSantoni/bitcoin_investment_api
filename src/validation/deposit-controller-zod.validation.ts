import { z } from 'zod'
import { BaseZodValidation } from '@/validation/base-zod.validation'
import { DepositControllerInput } from '@/application/controllers/deposit.controller'

export class DepositControllerZodValidation extends BaseZodValidation<DepositControllerInput> {
  protected schema = z.object({
    amount: z.number().gt(0, 'Its not possible to deposit negative values'),
    userId: z.string({ message: 'Missing information' }),
  })
}

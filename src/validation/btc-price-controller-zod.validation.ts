import { z } from 'zod'
import { BaseZodValidation } from '@/validation/base-zod.validation'
import { BTCPriceControllerInput } from '@/application/controllers/btc-price.controller'

export class BTCPriceControllerZodValidation extends BaseZodValidation<BTCPriceControllerInput> {
  protected schema = z.object({
    userId: z.string({ message: 'Missing information' }),
  })
}

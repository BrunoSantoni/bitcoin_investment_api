import { z } from 'zod'
import { BaseZodValidation } from '@/validation/base-zod.validation'
import { SignUpControllerInput } from '@/application/controllers/sign-up.controller'

export class SignUpControllerZodValidation extends BaseZodValidation<SignUpControllerInput> {
  protected schema = z.object({
    name: z.string(),
    email: z.string().email('Invalid email'),
    password: z.string().min(8, 'Password should have at least 8 characters'),
  })
}

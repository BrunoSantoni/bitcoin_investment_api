import { z } from 'zod'
import { BaseZodValidation } from '@/validation/base-zod.validation'
import { SignInControllerInput } from '@/application/controllers/sign-in.controller'

export class SignInControllerZodValidation extends BaseZodValidation<SignInControllerInput> {
  protected schema = z.object({
    email: z.string().email('Invalid email'),
    password: z.string().min(8, 'Password should have at least 8 characters'),
  })
}

import { BaseController } from '@/application/controllers/base.controller'
import { SignInController, SignInControllerInput } from '@/application/controllers/sign-in.controller'
import { makeUserSignInService } from '@/main/factories/services/user-sign-in-service.factory'
import { SignInControllerZodValidation } from '@/validation/sign-in-controller-zod.validation'

export const makeSignInController = (): BaseController<SignInControllerInput> => {
  const userSignInService = makeUserSignInService()
  const validator = new SignInControllerZodValidation()
  return new SignInController(userSignInService, validator)
}

import { BaseController } from '@/application/controllers/base.controller'
import { SignUpController, SignUpControllerInput } from '@/application/controllers/sign-up.controller'
import { SignupControllerZodValidation } from '@/validation/signup-controller-zod.validation'
import { makeUserSignUpService } from '@/main/factories/services/user-sign-up-service.factory'

export const makeSignUpController = (): BaseController<SignUpControllerInput> => {
  const userSignUpService = makeUserSignUpService()
  const validator = new SignupControllerZodValidation()
  return new SignUpController(userSignUpService, validator)
}

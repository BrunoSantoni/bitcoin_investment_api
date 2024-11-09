import { BaseController } from '@/application/controllers/base.controller'
import { UserSignUp } from '@/domain/contracts/user-sign-up.contract'
import { HttpResponse } from '@/application/contracts/http.contract'
import { badRequest, created } from '@/application/presenters/http.presenter'
import { Validator } from '@/application/contracts/validator.contract'

export type SignUpControllerInput = {
  name: string
  email: string
  password: string
}

export class SignUpController extends BaseController<SignUpControllerInput> {
  name = 'SignUpController'

  constructor(
    private readonly userSignUpService: UserSignUp,
    private readonly validator: Validator<SignUpControllerInput>,
  ) {
    super()
  }

  protected async perform(payload: SignUpControllerInput): Promise<HttpResponse> {
    const { name, email, password } = payload
    const response = await this.userSignUpService.handle({
      name,
      email,
      password,
    })

    if (!response.success) {
      return badRequest(typeof response?.data?.message === 'string' ? response.data.message : 'Cannot create user with provided info. Try again.')
    }

    return created({
      ...response.data,
    })
  }

  protected validate(payload: SignUpControllerInput): void {
    this.validator.validate(payload)
  }
}

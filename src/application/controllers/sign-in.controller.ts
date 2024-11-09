import { BaseController } from '@/application/controllers/base.controller'
import { HttpResponse } from '@/application/contracts/http.contract'
import { ok, unauthorized } from '@/application/presenters/http.presenter'
import { Validator } from '@/application/contracts/validator.contract'
import { UserSignIn } from '@/domain/contracts/user-sign-in.contract'

export type SignInControllerInput = {
  email: string
  password: string
}

export class SignInController extends BaseController<SignInControllerInput> {
  name = 'SignInController'

  constructor(
    private readonly userSignInService: UserSignIn,
    private readonly validator: Validator<SignInControllerInput>,
  ) {
    super()
  }

  protected async perform(payload: SignInControllerInput): Promise<HttpResponse> {
    const { email, password } = payload
    const response = await this.userSignInService.handle({
      email,
      password,
    })

    if (!response.success) {
      return unauthorized(typeof response?.data?.message === 'string' ? response.data.message : 'Invalid credentials')
    }

    return ok({
      ...response.data,
    })
  }

  protected validate(payload: SignInControllerInput): void {
    this.validator.validate(payload)
  }
}

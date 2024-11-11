import { Middleware } from '@/application/contracts/middleware'
import { TokenVerifier } from '@/domain/contracts/token.contract'
import { ok, serverError, unauthorized } from '@/application/presenters/http.presenter'
import { HttpResponse } from '@/application/contracts/http.contract'

export class AuthMiddleware<T extends { accessToken: string }> implements Middleware<T> {
  constructor(
    private readonly tokenVerifier: TokenVerifier,
  ) {}

  async handle(input: T): Promise<HttpResponse> {
    try {
      const { accessToken } = input

      if (!accessToken) {
        return unauthorized('Access Denied')
      }

      const userId = await this.tokenVerifier.decrypt(accessToken)

      return ok({ userId: userId as string })
    }
    catch {
      return serverError('Unexpected error in Authentication Middleware')
    }
  }
}

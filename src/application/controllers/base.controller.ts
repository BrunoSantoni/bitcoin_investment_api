import { HttpResponse } from '@/application/contracts/http.contract'
import { ValidationError } from '@/domain/errors/validation.error'
import { badRequest, serverError } from '@/application/presenters/http.presenter'

export abstract class BaseController<T> {
  async handle(payload: never): Promise<HttpResponse> {
    try {
      this.validate(payload)

      const specificControllerResponse = await this.perform(payload)

      return specificControllerResponse
    }
    catch (error) {
      let message: string | undefined
      if (error instanceof ValidationError) {
        return badRequest(error.message)
      }
      if (error instanceof Error) {
        message = `Unexpected error: ${error.message}`
      }
      return serverError(message)
    }
  }

  protected abstract perform(payload: T): Promise<HttpResponse>

  protected abstract validate(payload: T): void
}

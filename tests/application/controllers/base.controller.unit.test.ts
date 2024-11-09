import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { BaseController } from '@/application/controllers/base.controller'
import { HttpResponse } from '@/application/contracts/http.contract'
import { success } from '@/application/presenters/http.presenter'
import { ValidationError } from '@/domain/errors/validation.error'

type FakeControllerInput = {
  validationError: boolean
  serverError: boolean
}

class FakeController extends BaseController<FakeControllerInput> {
  name = 'FakeController'

  async perform(payload: FakeControllerInput): Promise<HttpResponse> {
    if (payload.serverError) {
      throw new Error('any-error')
    }

    return success({
      any: 'data',
    })
  }

  validate(payload: FakeControllerInput): void {
    if (payload.validationError) {
      throw new ValidationError('any-error')
    }
  }
}

describe('Base Controller', () => {
  let sut: FakeController
  let fakeInput: FakeControllerInput

  beforeAll(() => {
    fakeInput = {
      serverError: false,
      validationError: false,
    }
  })

  beforeEach(() => {
    sut = new FakeController()
  })

  it('should return bad request when controller.validate throws', async () => {
    const output = await sut.handle({
      serverError: false,
      validationError: true,
    })

    expect(output).toEqual({
      status: 400,
      body: {
        message: 'ValidationError: any-error',
      },
    })
  })

  it('should return server error when controller.perform throws unspecified error', async () => {
    const output = await sut.handle({
      serverError: true,
      validationError: false,
    })

    expect(output).toEqual({
      status: 500,
      body: {
        message: 'Unexpected error: any-error',
      },
    })
  })

  it('should return success response when controller.validate executes successfully', async () => {
    const output = await sut.handle(fakeInput)

    expect(output).toEqual({
      status: 200,
      body: {
        any: 'data',
      },
    })
  })
})

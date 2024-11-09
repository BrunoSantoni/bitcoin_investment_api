import { beforeAll, beforeEach, describe, expect, it, Mocked, vi } from 'vitest'
import { Validator } from '@/application/contracts/validator.contract'
import { ValidationError } from '@/domain/errors/validation.error'
import { SignInController, SignInControllerInput } from '@/application/controllers/sign-in.controller'
import { UserSignIn, UserSignInInput } from '@/domain/contracts/user-sign-in.contract'

describe('SignIn Controller', () => {
  let sut: SignInController
  let fakeUserSignInService: Mocked<UserSignIn>
  let fakeValidator: Mocked<Validator<SignInControllerInput>>
  let fakeInput: UserSignInInput

  beforeAll(() => {
    fakeUserSignInService = {
      handle: vi.fn().mockResolvedValue({
        success: true,
        data: {
          accessToken: 'any-token',
        },
      }),
    }
    fakeValidator = {
      validate: vi.fn(),
    }
    fakeInput = {
      email: 'any@mail.com',
      password: 'any-password',
    }
  })

  beforeEach(() => {
    vi.clearAllMocks()

    sut = new SignInController(fakeUserSignInService, fakeValidator)
  })

  it('should return bad request when validate throws', async () => {
    fakeValidator.validate.mockImplementationOnce(() => {
      throw new ValidationError('any-validation-error')
    })

    const output = await sut.handle(fakeInput)

    expect(output).toEqual({
      status: 400,
      body: {
        message: 'ValidationError: any-validation-error',
      },
    })
  })

  it('should return server error when userSignInService.handle throws unhandled error', async () => {
    fakeUserSignInService.handle.mockImplementationOnce(() => {
      throw new Error('any-error')
    })

    const output = await sut.handle(fakeInput)

    expect(output).toEqual({
      status: 500,
      body: {
        message: 'Unexpected error: any-error',
      },
    })
  })

  it('should call userSignInService.handle with correct input', async () => {
    await sut.handle(fakeInput)

    expect(fakeUserSignInService.handle).toHaveBeenCalledWith({
      email: 'any@mail.com',
      password: 'any-password',
    })
    expect(fakeUserSignInService.handle).toHaveBeenCalledTimes(1)
  })

  it.each([['any-custom-message', 'any-custom-message'], [undefined, 'Invalid credentials']])('should return unauthorized when userSignInService.handle returns success = false',
    async (serviceReturnedMessage, outputMessage) => {
      fakeUserSignInService.handle.mockResolvedValueOnce({
        success: false,
        data: {
          message: serviceReturnedMessage,
        },
      })

      const output = await sut.handle(fakeInput)

      expect(output).toEqual({
        status: 401,
        body: {
          message: outputMessage,
        },
      })
    })

  it('should return ok with accessToken on success', async () => {
    const output = await sut.handle(fakeInput)

    expect(output).toEqual({
      status: 200,
      body: {
        accessToken: 'any-token',
      },
    })
  })
})

import { beforeAll, beforeEach, describe, expect, it, Mocked, vi } from 'vitest'
import { SignUpController, SignUpControllerInput } from '@/application/controllers/sign-up.controller'
import { UserSignUp, UserSignUpInput } from '@/domain/contracts/user-sign-up.contract'
import { Validator } from '@/application/contracts/validator.contract'
import { ValidationError } from '@/domain/errors/validation.error'

describe('SignUp Controller', () => {
  let sut: SignUpController
  let fakeUserSignUpService: Mocked<UserSignUp>
  let fakeValidator: Mocked<Validator<SignUpControllerInput>>
  let fakeInput: UserSignUpInput

  beforeAll(() => {
    fakeUserSignUpService = {
      handle: vi.fn().mockResolvedValue({
        success: true,
        data: {
          id: 'any-id',
        },
      }),
    }
    fakeValidator = {
      validate: vi.fn(),
    }
    fakeInput = {
      name: 'any-name',
      email: 'any@mail.com',
      password: 'any-password',
    }
  })

  beforeEach(() => {
    vi.clearAllMocks()

    sut = new SignUpController(fakeUserSignUpService, fakeValidator)
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

  it('should return server error when userSignUpService.handle throws unhandled error', async () => {
    fakeUserSignUpService.handle.mockImplementationOnce(() => {
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

  it('should call userSignUpService.handle with correct input', async () => {
    await sut.handle(fakeInput)

    expect(fakeUserSignUpService.handle).toHaveBeenCalledWith({
      name: 'any-name',
      email: 'any@mail.com',
      password: 'any-password',
    })
    expect(fakeUserSignUpService.handle).toHaveBeenCalledTimes(1)
  })

  it.each([['any-custom-message', 'any-custom-message'], [undefined, 'Cannot create user with provided info. Try again.']])('should return bad request when userSignUpService.handle returns success = false',
    async (serviceReturnedMessage, outputMessage) => {
      fakeUserSignUpService.handle.mockResolvedValueOnce({
        success: false,
        data: {
          message: serviceReturnedMessage,
        },
      })

      const output = await sut.handle(fakeInput)

      expect(output).toEqual({
        status: 400,
        body: {
          message: outputMessage,
        },
      })
    })

  it('should return created on success', async () => {
    const output = await sut.handle(fakeInput)

    expect(output).toEqual({
      status: 201,
      body: {
        id: 'any-id',
      },
    })
  })
})

import { beforeAll, beforeEach, describe, expect, it, Mocked, vi } from 'vitest'
import { Validator } from '@/application/contracts/validator.contract'
import { ValidationError } from '@/domain/errors/validation.error'
import { DepositController } from '@/application/controllers/deposit.controller'
import { UserDeposit, UserDepositInput } from '@/domain/contracts/user-deposit.contract'

describe('Deposit Controller', () => {
  let sut: DepositController
  let fakeUserDepositService: Mocked<UserDeposit>
  let fakeValidator: Mocked<Validator<UserDepositInput>>
  let fakeInput: UserDepositInput

  beforeAll(() => {
    fakeUserDepositService = {
      handle: vi.fn().mockResolvedValue({
        success: true,
      }),
    }
    fakeValidator = {
      validate: vi.fn(),
    }
    fakeInput = {
      amount: 10,
      userId: 'any-user-id',
    }
  })

  beforeEach(() => {
    vi.clearAllMocks()

    sut = new DepositController(fakeUserDepositService, fakeValidator)
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

  it('should return server error when userDepositService.handle throws unhandled error', async () => {
    fakeUserDepositService.handle.mockImplementationOnce(() => {
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

  it('should call userDepositService.handle with correct input', async () => {
    await sut.handle(fakeInput)

    expect(fakeUserDepositService.handle).toHaveBeenCalledWith({
      amount: 10,
      userId: 'any-user-id',
    })
    expect(fakeUserDepositService.handle).toHaveBeenCalledTimes(1)
  })

  it.each([['any-custom-message', 'any-custom-message'], [undefined, 'Cannot create deposit']])('should return badRequest when userDepositService.handle returns success = false',
    async (serviceReturnedMessage, outputMessage) => {
      fakeUserDepositService.handle.mockResolvedValueOnce({
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

  it('should return no content on success', async () => {
    const output = await sut.handle(fakeInput)

    expect(output).toEqual({
      status: 204,
      body: {},
    })
  })
})

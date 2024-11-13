import { beforeAll, beforeEach, describe, expect, it, Mocked, vi } from 'vitest'
import { Validator } from '@/application/contracts/validator.contract'
import { ValidationError } from '@/domain/errors/validation.error'
import { BalanceController } from '@/application/controllers/balance.controller'
import { UserBalance, UserBalanceInput } from '@/domain/contracts/user-balance.contract'

describe('Balance Controller', () => {
  let sut: BalanceController
  let fakeUserBalanceService: Mocked<UserBalance>
  let fakeValidator: Mocked<Validator<UserBalanceInput>>
  let fakeInput: UserBalanceInput

  beforeAll(() => {
    fakeUserBalanceService = {
      handle: vi.fn().mockResolvedValue({
        success: true,
        data: {
          balance: 1.50,
        },
      }),
    }
    fakeValidator = {
      validate: vi.fn(),
    }
    fakeInput = {
      userId: 'any-user-id',
    }
  })

  beforeEach(() => {
    vi.clearAllMocks()

    sut = new BalanceController(fakeUserBalanceService, fakeValidator)
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

  it('should return server error when userBalanceService.handle throws unhandled error', async () => {
    fakeUserBalanceService.handle.mockImplementationOnce(() => {
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

  it('should call userBalanceService.handle with correct input', async () => {
    await sut.handle(fakeInput)

    expect(fakeUserBalanceService.handle).toHaveBeenCalledWith({
      userId: 'any-user-id',
    })
    expect(fakeUserBalanceService.handle).toHaveBeenCalledTimes(1)
  })

  it.each([['any-custom-message', 'any-custom-message'], [undefined, 'Cannot create balance']])('should return badRequest when userBalanceService.handle returns success = false',
    async (serviceReturnedMessage, outputMessage) => {
      fakeUserBalanceService.handle.mockResolvedValueOnce({
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

  it('should return 200 ok with data on success', async () => {
    const output = await sut.handle(fakeInput)

    expect(output).toEqual({
      status: 200,
      body: {
        balance: 1.50,
      },
    })
  })
})

import { beforeAll, beforeEach, describe, expect, it, Mocked, vi } from 'vitest'
import { BTCPriceController, BTCPriceControllerInput } from '@/application/controllers/btc-price.controller'
import { BTCPrice } from '@/domain/contracts/btc-price.contract'
import { Validator } from '@/application/contracts/validator.contract'
import { ValidationError } from '@/domain/errors/validation.error'

describe('BTC Price Controller', () => {
  let sut: BTCPriceController
  let fakeBTCPriceService: Mocked<BTCPrice>
  let fakeValidator: Mocked<Validator<BTCPriceControllerInput>>
  let fakeInput: BTCPriceControllerInput

  beforeAll(() => {
    fakeBTCPriceService = {
      handle: vi.fn().mockResolvedValue({
        success: true,
        data: {
          purchasePrice: 537963.39,
          salePrice: 539677.67,
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

    sut = new BTCPriceController(fakeBTCPriceService, fakeValidator)
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

  it('should return server error when btcPriceService.handle throws unhandled error', async () => {
    fakeBTCPriceService.handle.mockImplementationOnce(() => {
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

  it('should call btcPriceService.handle without params', async () => {
    await sut.handle(fakeInput)

    expect(fakeBTCPriceService.handle).toHaveBeenCalledWith()
    expect(fakeBTCPriceService.handle).toHaveBeenCalledTimes(1)
  })

  it.each([['any-custom-message', 'any-custom-message'], [undefined, 'Error when trying to obtain BTC price']])('should return badRequest when btcPriceService.handle returns success = false',
    async (serviceReturnedMessage, outputMessage) => {
      fakeBTCPriceService.handle.mockResolvedValueOnce({
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
        purchasePrice: 537963.39,
        salePrice: 539677.67,
      },
    })
  })
})

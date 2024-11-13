import { beforeAll, beforeEach, describe, expect, it, Mocked, vi } from 'vitest'
import { BTCPriceController } from '@/application/controllers/btc-price.controller'
import { BTCPrice } from '@/domain/contracts/btc-price.contract'

describe('BTC Price Controller', () => {
  let sut: BTCPriceController
  let fakeBTCPriceService: Mocked<BTCPrice>

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
  })

  beforeEach(() => {
    vi.clearAllMocks()

    sut = new BTCPriceController(fakeBTCPriceService)
  })

  it('should return server error when btcPriceService.handle throws unhandled error', async () => {
    fakeBTCPriceService.handle.mockImplementationOnce(() => {
      throw new Error('any-error')
    })

    const output = await sut.handle()

    expect(output).toEqual({
      status: 500,
      body: {
        message: 'Unexpected error: any-error',
      },
    })
  })

  it('should call btcPriceService.handle without params', async () => {
    await sut.handle()

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

      const output = await sut.handle()

      expect(output).toEqual({
        status: 400,
        body: {
          message: outputMessage,
        },
      })
    })

  it('should return 200 ok with data on success', async () => {
    const output = await sut.handle()

    expect(output).toEqual({
      status: 200,
      body: {
        purchasePrice: 537963.39,
        salePrice: 539677.67,
      },
    })
  })
})

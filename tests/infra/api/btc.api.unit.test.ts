import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { BTCApi } from '@/infra/apis/btc.api'

describe('BTC API', () => {
  let sut: BTCApi
  let fakeBaseUrl: string

  beforeAll(() => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ([
        {
          buy: 537963.39227,
          sell: 539677.66989998,
        },
      ]),
    } as Response)

    fakeBaseUrl = 'http://any-url.com'
  })

  beforeEach(() => {
    vi.clearAllMocks()

    sut = new BTCApi(fakeBaseUrl)
  })

  it('should rethrow when fetch throws', () => {
    vi.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('any-error'))

    const promise = sut.obtainCurrentPrice()

    expect(() => promise).rejects.toThrow()
  })

  describe('obtainCurrentPrice', () => {
    it('should throw when raw fetch response is not ok', () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ([
          {
            buy: 537963.39227,
            sell: 539677.66989998,
          },
        ]),
      } as Response)

      const promise = sut.obtainCurrentPrice()

      expect(() => promise).rejects.toThrow(new Error('[BitcoinApi.obtain]: Failed to fetch from API. Status code: 500'))
    })

    it.each([[1, undefined], [undefined, 1], [undefined, null]])('should throw when received response is NaN', (buy, sell) => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => ([
          {
            buy,
            sell,
          },
        ]),
      } as Response)

      const promise = sut.obtainCurrentPrice()

      expect(() => promise).rejects.toThrow(new Error(`[BitcoinApi.obtain]: Received invalid prices from response. Purchase: ${buy} / Sale: ${sell}`))
    })

    it('should rethrow when response does not contain required params', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          buy: 537963.39227,
        }
        ),
      } as Response)

      const promise = sut.obtainCurrentPrice()

      expect(() => promise).rejects.toThrow()
    })

    it('should return converted buy and sell values to number on success', async () => {
      const output = await sut.obtainCurrentPrice()

      expect(output).toEqual({
        purchasePrice: 537963.39227,
        salePrice: 539677.66989998,
      })
    })
  })
})

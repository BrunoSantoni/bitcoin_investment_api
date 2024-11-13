import { ObtainCurrentBTCPrice, ObtainCurrentBTCPriceOutput } from '@/domain/contracts/btc-actions.contract'
import { BTCApiResponse } from '@/infra/contracts/bitcoin.api.contract'

export class BTCApi implements ObtainCurrentBTCPrice {
  constructor(
    private readonly apiBaseUrl: string,
  ) {}

  async obtainCurrentPrice(): Promise<ObtainCurrentBTCPriceOutput> {
    const rawFetchResponse = await fetch(`${this.apiBaseUrl}/tickers?symbols=BTC-BRL`)

    if (!rawFetchResponse.ok) {
      throw new Error(`[BitcoinApi.obtain]: Failed to fetch from API. Status code: ${rawFetchResponse.status}`)
    }
    const [{ buy, sell }]: BTCApiResponse = await rawFetchResponse.json()

    const isResponseMalformed = Number.isNaN(Number(buy)) || Number.isNaN(Number(sell))

    if (isResponseMalformed) {
      throw new Error(`[BitcoinApi.obtain]: Received invalid prices from response. Purchase: ${buy} / Sale: ${sell}`)
    }

    return {
      purchasePrice: Number(buy),
      salePrice: Number(sell),
    }
  }
}

export type BTCPriceOutput = {
  success: boolean
  data?: Record<string, unknown>
}

export interface BTCPrice {
  handle: () => Promise<BTCPriceOutput>
}

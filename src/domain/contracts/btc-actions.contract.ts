export type ObtainCurrentBTCPriceOutput = {
  purchasePrice: number
  salePrice: number
}

export interface ObtainCurrentBTCPrice {
  obtainCurrentPrice(): Promise<ObtainCurrentBTCPriceOutput>
}

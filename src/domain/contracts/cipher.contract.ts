export interface Encrypt {
  hash(textToHash: string): string
}

export type CipherCompareInput = {
  plainText: string
  hashedText: string
}

export interface CipherCompare {
  verify(input: CipherCompareInput): boolean
}

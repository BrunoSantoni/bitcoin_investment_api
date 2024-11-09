export interface TokenGenerator {
  encrypt(decryptedValues: object): Promise<string>
}

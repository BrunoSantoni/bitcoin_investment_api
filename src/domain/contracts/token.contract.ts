export interface TokenGenerator {
  encrypt(decryptedValues: object): Promise<string>
}

export interface TokenVerifier {
  decrypt(encryptedValues: string): Promise<string>
}

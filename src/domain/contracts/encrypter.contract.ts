export interface Encrypter {
  hash(textToHash: string): string
}

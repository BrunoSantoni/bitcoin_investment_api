import crypto from 'node:crypto'
import { CipherCompare, CipherCompareInput, Encrypt } from '@/domain/contracts/cipher.contract'

export class CryptoCipher implements Encrypt, CipherCompare {
  private readonly salt: string
  private readonly RANDOM_BYTES_SIZE = 16
  constructor() {
    this.salt = crypto.randomBytes(this.RANDOM_BYTES_SIZE).toString('hex')
  }

  hash(textToHash: string): string {
    const hashed = crypto.scryptSync(textToHash, this.salt, 64).toString('hex')
    return `${this.salt}:${hashed}`
  }

  verify(input: CipherCompareInput): boolean {
    const { plainText, hashedText } = input
    const [salt, hashedStoredText] = hashedText.split(':')
    const hashedPlainText = crypto.scryptSync(plainText, salt, 64).toString('hex')

    return hashedPlainText === hashedStoredText
  }
}

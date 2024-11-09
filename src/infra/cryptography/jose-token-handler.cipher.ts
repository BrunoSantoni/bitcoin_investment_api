import { SignJWT } from 'jose'
import { TokenGenerator } from '@/domain/contracts/token.contract'

export type JoseTokenHandlerInput = {
  secret: string
}

export class JoseTokenHandler implements TokenGenerator {
  private readonly encodedSecret: Uint8Array

  constructor(input: JoseTokenHandlerInput) {
    const encoder = new TextEncoder()
    this.encodedSecret = encoder.encode(input.secret)
  }

  async encrypt(decryptedValues: object): Promise<string> {
    const encryptedText = await new SignJWT({ ...decryptedValues })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('1h')
      .sign(this.encodedSecret)

    return encryptedText
  }
}

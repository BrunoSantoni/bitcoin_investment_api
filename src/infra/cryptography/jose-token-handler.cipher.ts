import { jwtVerify, SignJWT } from 'jose'
import { TokenGenerator, TokenVerifier } from '@/domain/contracts/token.contract'

export type JoseTokenHandlerInput = {
  secret: string
}

export class JoseTokenHandler implements TokenGenerator, TokenVerifier {
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

  async decrypt(encryptedValues: string): Promise<string> {
    const { payload } = await jwtVerify<{ userId: string }>(encryptedValues, this.encodedSecret)
    const userId = payload.userId

    return userId
  }
}

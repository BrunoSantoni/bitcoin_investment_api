import { AccountPrismaRepository } from '@/infra/repositories/account.prisma.repository'
import { CryptoCipher } from '@/infra/cryptography/crypto.cipher'
import { UserSignIn } from '@/domain/contracts/user-sign-in.contract'
import { UserSignInService } from '@/domain/services/user-sign-in.service'
import { JoseTokenHandler } from '@/infra/cryptography/jose-token-handler.cipher'
import { env } from '@/main/config/env'

export const makeUserSignInService = (): UserSignIn => {
  const accountRepository = new AccountPrismaRepository()
  const cryptoCipher = new CryptoCipher()
  const joseTokenHandler = new JoseTokenHandler({
    secret: env.jwtSecret,
  })

  return new UserSignInService(accountRepository, cryptoCipher, joseTokenHandler)
}

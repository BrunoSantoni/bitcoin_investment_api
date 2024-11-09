import { UserSignUpService } from '@/domain/services/user-sign-up.service'
import { UserSignUp } from '@/domain/contracts/user-sign-up.contract'
import { AccountPrismaRepository } from '@/infra/repositories/account.prisma.repository'
import { CryptoCipher } from '@/infra/cryptography/crypto.cipher'

export const makeUserSignUpService = (): UserSignUp => {
  const accountRepository = new AccountPrismaRepository()
  const cryptoCipher = new CryptoCipher()

  return new UserSignUpService(accountRepository, accountRepository, cryptoCipher)
}

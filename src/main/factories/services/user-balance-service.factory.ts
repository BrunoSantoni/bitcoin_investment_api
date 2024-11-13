import { AccountPrismaRepository } from '@/infra/repositories/account.prisma.repository'
import { UserBalance } from '@/domain/contracts/user-balance.contract'
import { UserBalanceService } from '@/domain/services/user-balance.service'

export const makeUserBalanceService = (): UserBalance => {
  const accountRepository = new AccountPrismaRepository()

  return new UserBalanceService(accountRepository)
}

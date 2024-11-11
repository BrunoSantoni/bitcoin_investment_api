import { AccountPrismaRepository } from '@/infra/repositories/account.prisma.repository'
import { UserDepositService } from '@/domain/services/user-deposit.service'
import { UserDeposit } from '@/domain/contracts/user-deposit.contract'
import { SendToQueue } from '@/domain/contracts/queue.contract'
import { env } from '@/main/config/env'

export const makeUserDepositService = (queueInstance: SendToQueue): UserDeposit => {
  const accountRepository = new AccountPrismaRepository()

  return new UserDepositService(accountRepository, accountRepository, queueInstance, env.newDepositConfirmationEmailQueueName)
}

import { AccountPrismaRepository } from '@/infra/repositories/account.prisma.repository'
import { env } from '@/main/config/env'
import { UserDepositService } from '@/domain/services/user-deposit.service'
import { UserDeposit } from '@/domain/contracts/user-deposit.contract'
import { EmailSendGridSdk } from '@/infra/sdks/email.sendgrid.sdk'

export const makeUserDepositService = (): UserDeposit => {
  const accountRepository = new AccountPrismaRepository()
  const sendConfirmationEmailToUserSdk = new EmailSendGridSdk(env.sendGridApiKey, env.sendGridEmailSender)

  return new UserDepositService(accountRepository, accountRepository, sendConfirmationEmailToUserSdk)
}

import { FindUserAccountById, UpdateUserBalance } from '@/domain/contracts/account-actions.contract'
import { UserDeposit, UserDepositInput, UserDepositOutput } from '@/domain/contracts/user-deposit.contract'
import { SendConfirmationMailToUser } from '@/domain/contracts/mail.contract'

export class UserDepositService implements UserDeposit {
  constructor(
    private readonly findUserAccountByIdRepository: FindUserAccountById,
    private readonly updateUserBalanceRepository: UpdateUserBalance,
    private readonly sendConfirmationEmailToUserSdk: SendConfirmationMailToUser,
  ) {
  }

  async handle(input: UserDepositInput): Promise<UserDepositOutput> {
    const { amount, userId } = input
    const userAccount = await this.findUserAccountByIdRepository.findById(userId)

    if (userAccount === null) {
      return {
        success: false,
        data: {
          message: 'Account not found',
        },
      }
    }

    await this.updateUserBalanceRepository.updateBalance({
      userId,
      amountInCents: amount * 100,
      type: 'deposit',
    })

    // TODO: Async
    const wasConfirmationEmailSent = await this.sendConfirmationEmailToUserSdk.send({
      userEmail: userAccount.email,
      subject: `Test API - Deposit of R$${amount} to ${userAccount.name}`,
      text: 'The requested amount was deposited in your account. This is a email sent from a technical test, and its not real money',
    })

    if (!wasConfirmationEmailSent) {
      // TODO: add retry
      console.warn('[UserDepositService]: Confirmation mail was not sent to user')
    }

    return {
      success: true,
    }
  }
}

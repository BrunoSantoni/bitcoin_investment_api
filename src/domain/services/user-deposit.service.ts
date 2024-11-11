import { FindUserAccountById, UpdateUserBalance } from '@/domain/contracts/account-actions.contract'
import { UserDeposit, UserDepositInput, UserDepositOutput } from '@/domain/contracts/user-deposit.contract'
import { SendToQueue } from '@/domain/contracts/queue.contract'
import { SendConfirmationMailToUserInput } from '@/domain/contracts/mail.contract'

export class UserDepositService implements UserDeposit {
  constructor(
    private readonly findUserAccountByIdRepository: FindUserAccountById,
    private readonly updateUserBalanceRepository: UpdateUserBalance,
    private readonly sendConfirmationEmailToQueue: SendToQueue,
    private readonly emailQueueName: string,
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

    const messageToSendEmailQueue: SendConfirmationMailToUserInput = {
      userEmail: userAccount.email,
      subject: `Test API - Test deposit has been made`,
      text: `Hello ${userAccount.name}, the deposit of R$${amount} was successfully made. This is a email sent from a technical test for a company, and its not real money`,
    }

    await this.sendConfirmationEmailToQueue.sendToQueue({
      queueName: this.emailQueueName,
      message: JSON.stringify(messageToSendEmailQueue),
    })

    console.log('[UserDepositService]: Confirmation email sent to queue')

    return {
      success: true,
    }
  }
}

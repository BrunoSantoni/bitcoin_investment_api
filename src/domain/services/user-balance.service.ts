import { FindUserAccountById } from '@/domain/contracts/account-actions.contract'
import { UserBalance, UserBalanceInput, UserBalanceOutput } from '@/domain/contracts/user-balance.contract'

export class UserBalanceService implements UserBalance {
  constructor(
    private readonly findUserAccountByIdRepository: FindUserAccountById,
  ) {
  }

  async handle(input: UserBalanceInput): Promise<UserBalanceOutput> {
    const { userId } = input
    const userAccount = await this.findUserAccountByIdRepository.findById(userId)

    if (userAccount === null) {
      console.warn('[UserBalanceService]: User not found for provided id', userId)
      return {
        success: false,
        data: {
          message: 'Account not found',
        },
      }
    }

    const convertedUserBalance = userAccount.convertBalanceInBRL()

    console.log('[UserBalanceService]: Balance in cents converted to BRL')

    return {
      success: true,
      data: {
        balance: convertedUserBalance,
      },
    }
  }
}

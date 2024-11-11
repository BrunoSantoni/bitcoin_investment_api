import { SavedUser, User } from '@/domain/entities/user.entity'

export interface CreateAccount {
  create(user: User): Promise<SavedUser>
}

export interface FindUserAccountByEmail {
  findByEmail(email: string): Promise<SavedUser | null>
}

export interface FindUserAccountById {
  findById(id: string): Promise<SavedUser | null>
}

export type UpdateUserBalanceInput = {
  userId: string
  amountInCents: number
  type: 'deposit' | 'withdraw'
}

export interface UpdateUserBalance {
  updateBalance(input: UpdateUserBalanceInput): Promise<SavedUser | null>
}

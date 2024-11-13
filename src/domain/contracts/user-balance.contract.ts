export type UserBalanceInput = {
  userId: string
}

export type UserBalanceOutput = {
  success: boolean
  data?: Record<string, unknown>
}

export interface UserBalance {
  handle: (input: UserBalanceInput) => Promise<UserBalanceOutput>
}

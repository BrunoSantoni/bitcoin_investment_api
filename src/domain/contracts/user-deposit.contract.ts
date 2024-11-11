export type UserDepositInput = {
  amount: number
  userId: string
}

export type UserDepositOutput = {
  success: boolean
  data?: Record<string, unknown>
}

export interface UserDeposit {
  handle: (input: UserDepositInput) => Promise<UserDepositOutput>
}

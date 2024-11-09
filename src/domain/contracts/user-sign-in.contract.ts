export type UserSignInInput = {
  email: string
  password: string
}

export type UserSignInOutput = {
  success: boolean
  data?: Record<string, unknown>
}

export interface UserSignIn {
  handle: (input: UserSignInInput) => Promise<UserSignInOutput>
}

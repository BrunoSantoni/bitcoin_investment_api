export type UserSignUpInput = {
  name: string
  email: string
  password: string
}

export type UserSignUpOutput = {
  success: boolean
  data?: Record<string, unknown>
}

export interface UserSignUp {
  handle: (input: UserSignUpInput) => Promise<UserSignUpOutput>
}

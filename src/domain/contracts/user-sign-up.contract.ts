export type UserSignUpInput = {
  name: string
  email: string
  password: string
}

export type UserSignUpOutput = boolean

export interface UserSignUp {
  handle: (input: UserSignUpInput) => Promise<UserSignUpOutput>
}

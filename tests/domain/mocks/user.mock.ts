import { UserSignUpInput } from '@/domain/contracts/user-sign-up.contract'
import { UserInput } from '@/domain/entities/user.entity'
import { UserSignInInput } from '@/domain/contracts/user-sign-in.contract'

export const userSignUpInputMock = (): UserSignUpInput => ({
  name: 'any-name',
  email: 'any@mail.com',
  password: 'any-value',
})

export const userSignInInputMock = (): UserSignInInput => ({
  email: 'valid@mail.com',
  password: 'any-password',
})

export const userEntityInputMock = (): UserInput => ({
  name: 'any-name',
  email: 'any@mail.com',
  hashedPassword: 'any-hashed-password',
})

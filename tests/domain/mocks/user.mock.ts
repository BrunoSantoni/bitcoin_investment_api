import { UserSignUpInput } from '@/domain/contracts/user-sign-up.contract'
import { UserInput } from '@/domain/entities/user.entity'

export const userSignUpInputMock = (): UserSignUpInput => ({
  name: 'any-name',
  email: 'any@mail.com',
  password: 'any-value',
})

export const userEntityInputMock = (): UserInput => ({
  name: 'any-name',
  email: 'any@mail.com',
  hashedPassword: 'any-hashed-password',
})

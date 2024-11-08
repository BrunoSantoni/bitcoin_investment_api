import { ValidationError } from '@/tests/domain/errors/validation.error'

export type UserInput = {
  name: string
  email: string
  hashedPassword: string
}

export class User {
  private readonly name: string
  private readonly email: string
  private readonly password: string

  constructor(input: UserInput) {
    this.name = input.name
    this.email = this.setEmail(input.email)
    this.password = input.hashedPassword
  }

  private setEmail(email: string): string {
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

    if (!isValidEmail) {
      throw new ValidationError('Invalid email')
    }

    return email
  }
}

import { ValidationError } from '@/domain/errors/validation.error'

export type UserInput = {
  name: string
  email: string
  hashedPassword: string
}

export type SavedUserInput = UserInput & { id: string }

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

export class SavedUser extends User {
  private readonly _id: string

  constructor(input: SavedUserInput) {
    const { id, ...userInput } = input
    super(userInput)
    this._id = id
  }

  public get id(): string {
    return this._id
  }
}

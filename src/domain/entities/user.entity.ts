import { ValidationError } from '@/domain/errors/validation.error'

export type UserInput = {
  name: string
  email: string
  hashedPassword: string
  balanceInCents?: number
}

export type SavedUserInput = UserInput & { id: string }

export class User {
  private readonly _name: string
  private readonly _email: string
  private readonly _password: string
  private readonly _balanceInCents: number

  constructor(input: UserInput) {
    this._name = input.name
    this._email = this.setEmail(input.email)
    this._password = input.hashedPassword
    this._balanceInCents = input.balanceInCents ?? 0
  }

  public get balanceInCents(): number {
    return this._balanceInCents
  }

  public get name(): string {
    return this._name
  }

  public get email(): string {
    return this._email
  }

  public get password(): string {
    return this._password
  }

  convertBalanceInBRL() {
    return this._balanceInCents / 100
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

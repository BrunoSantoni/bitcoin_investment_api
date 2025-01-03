import { describe, expect, it } from 'vitest'
import { SavedUser, SavedUserInput, User, UserInput } from '@/domain/entities/user.entity'

describe('User Entity', () => {
  it('should instantiate a new User when correct input is provided', () => {
    const input: UserInput = {
      name: 'any-name',
      email: 'any@mail.com',
      hashedPassword: 'any-hashed-password',
    }

    const output = new User(input)

    expect(output).toBeInstanceOf(User)
  })

  it('should instantiate a new User when correct input is provided with optional properties', () => {
    const input: UserInput = {
      name: 'any-name',
      email: 'any@mail.com',
      hashedPassword: 'any-hashed-password',
      balanceInCents: 100,
    }

    const output = new User(input)

    expect(output).toBeInstanceOf(User)
    expect(output.balanceInCents).toBe(100)
  })

  it('should throw when email is not valid', () => {
    const input: UserInput = {
      name: 'any-name',
      email: 'invalid-email',
      hashedPassword: 'any-hashed-password',
    }

    expect(() => new User(input)).toThrow()
  })

  it('should convert balance in BRL', () => {
    const input: UserInput = {
      name: 'any-name',
      email: 'any@mail.com',
      hashedPassword: 'any-hashed-password',
      balanceInCents: 1000,
    }

    const user = new User(input)
    const output = user.convertBalanceInBRL()

    expect(output).toBe(10)
  })
})

describe('SavedUser Entity', () => {
  it('should instantiate a new Saved User with an id', () => {
    const input: SavedUserInput = {
      name: 'any-name',
      email: 'any@mail.com',
      hashedPassword: 'any-hashed-password',
      id: 'any-id',
    }

    const output = new SavedUser(input)

    expect(output).toBeInstanceOf(SavedUser)
    expect(output.id).toBeDefined()
  })
})

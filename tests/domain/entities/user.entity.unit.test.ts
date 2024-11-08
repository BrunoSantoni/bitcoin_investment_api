import { describe, expect, it } from 'vitest'
import { User, UserInput } from '@/domain/entities/user.entity'

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

  it('should throw when email is not valid', () => {
    const input: UserInput = {
      name: 'any-name',
      email: 'invalid-email',
      hashedPassword: 'any-hashed-password',
    }

    expect(() => new User(input)).toThrow()
  })
})

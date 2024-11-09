import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { ValidationError } from '@/domain/errors/validation.error'
import { SignInControllerZodValidation } from '@/validation/sign-in-controller-zod.validation'
import { SignInControllerInput } from '@/application/controllers/sign-in.controller'

describe('SignIn Controller Zod Validation', () => {
  let sut: SignInControllerZodValidation
  let validFakeInput: SignInControllerInput
  let invalidFakeInput: Partial<SignInControllerInput>

  beforeAll(() => {
    validFakeInput = {
      email: 'valid@mail.com',
      password: 'valid-password',
    }

    invalidFakeInput = {
      email: 'valid@mail.com',
      password: 'invalid',
    }
  })

  beforeEach(() => {
    sut = new SignInControllerZodValidation()
  })

  it('should throw error when validation fails', () => {
    expect(() => sut.validate(invalidFakeInput as never)).toThrow(ValidationError)
  })

  it('should not throw error when validation succeeds', () => {
    expect(() => sut.validate(validFakeInput)).not.toThrow()
  })
})

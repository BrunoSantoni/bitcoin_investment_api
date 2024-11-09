import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { SignUpControllerZodValidation } from '@/validation/sign-up-controller-zod.validation'
import { SignUpControllerInput } from '@/application/controllers/sign-up.controller'
import { ValidationError } from '@/domain/errors/validation.error'

describe('SignUp Controller Zod Validation', () => {
  let sut: SignUpControllerZodValidation
  let validFakeInput: SignUpControllerInput
  let invalidFakeInput: Partial<SignUpControllerInput>

  beforeAll(() => {
    validFakeInput = {
      name: 'valid-name',
      email: 'valid@mail.com',
      password: 'valid-password',
    }

    invalidFakeInput = {
      name: 'invalid-name',
      email: 'invalid',
    }
  })

  beforeEach(() => {
    sut = new SignUpControllerZodValidation()
  })

  it('should throw error when validation fails', () => {
    expect(() => sut.validate(invalidFakeInput as never)).toThrow(ValidationError)
  })

  it('should not throw error when validation succeeds', () => {
    expect(() => sut.validate(validFakeInput)).not.toThrow()
  })
})

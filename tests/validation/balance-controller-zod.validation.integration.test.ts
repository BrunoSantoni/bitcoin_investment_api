import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { ValidationError } from '@/domain/errors/validation.error'
import { BalanceControllerZodValidation } from '@/validation/balance-controller-zod.validation'
import { BalanceControllerInput } from '@/application/controllers/balance.controller'

describe('Balance Controller Zod Validation', () => {
  let sut: BalanceControllerZodValidation
  let validFakeInput: BalanceControllerInput

  beforeAll(() => {
    validFakeInput = {
      userId: 'any-user-id',
    }
  })

  beforeEach(() => {
    sut = new BalanceControllerZodValidation()
  })

  it.each([
    {
      userId: null,
    },
    {
      userId: undefined,
    },
    {},
  ])('should throw error when validation fails', (invalidFakeInput) => {
    expect(() => sut.validate(invalidFakeInput as never)).toThrow(ValidationError)
  })

  it('should not throw error when validation succeeds', () => {
    expect(() => sut.validate(validFakeInput)).not.toThrow()
  })
})

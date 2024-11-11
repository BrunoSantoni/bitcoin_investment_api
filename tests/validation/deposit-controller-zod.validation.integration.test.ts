import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { ValidationError } from '@/domain/errors/validation.error'
import { DepositControllerZodValidation } from '@/validation/deposit-controller-zod.validation'
import { DepositControllerInput } from '@/application/controllers/deposit.controller'

describe('Deposit Controller Zod Validation', () => {
  let sut: DepositControllerZodValidation
  let validFakeInput: DepositControllerInput

  beforeAll(() => {
    validFakeInput = {
      amount: 200,
      userId: 'any-user-id',
    }
  })

  beforeEach(() => {
    sut = new DepositControllerZodValidation()
  })

  it.each([
    {
      amount: -100,
      userId: 'any-user-id',
    },
    {
      amount: 100,
    },
    {
      userId: 'any-user-id',
    },
  ])('should throw error when validation fails', (invalidFakeInput) => {
    expect(() => sut.validate(invalidFakeInput as never)).toThrow(ValidationError)
  })

  it('should not throw error when validation succeeds', () => {
    expect(() => sut.validate(validFakeInput)).not.toThrow()
  })
})

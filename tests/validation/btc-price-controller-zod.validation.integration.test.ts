import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { ValidationError } from '@/domain/errors/validation.error'
import { BTCPriceControllerZodValidation } from '@/validation/btc-price-controller-zod.validation'
import { BTCPriceControllerInput } from '@/application/controllers/btc-price.controller'

describe('BTC Price Controller Zod Validation', () => {
  let sut: BTCPriceControllerZodValidation
  let validFakeInput: BTCPriceControllerInput

  beforeAll(() => {
    validFakeInput = {
      userId: 'any-user-id',
    }
  })

  beforeEach(() => {
    sut = new BTCPriceControllerZodValidation()
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

import { z } from 'zod'
import { beforeEach, describe, expect, it } from 'vitest'
import { BaseZodValidation } from '@/validation/base-zod.validation'
import { ValidationError } from '@/domain/errors/validation.error'

class FakeZodValidation extends BaseZodValidation<string> {
  protected schema = z.string()
}

describe('Base Zod Validation', () => {
  let sut: FakeZodValidation

  beforeEach(() => {
    sut = new FakeZodValidation()
  })

  it('should not throw if validation was successfully executed', () => {
    expect(() => {
      sut.validate('any-value')
    }).not.toThrow()
  })

  it('should throw if validation was failed', () => {
    expect(() => {
      sut.validate(123 as never)
    }).toThrow(ValidationError)
  })
})

import { z } from 'zod'
import { Validator } from '@/application/contracts/validator.contract'
import { ValidationError } from '@/domain/errors/validation.error'

export abstract class BaseZodValidation<T> implements Validator<T> {
  protected abstract schema: z.Schema

  validate(payload: T): void {
    const validatedPayload = this.schema.safeParse(payload)

    if (!validatedPayload.success) {
      console.log('[BaseZodValidation]: Validation finished with error', {
        issues: validatedPayload.error.issues,
        errors: validatedPayload.error.errors,
        message: validatedPayload.error.message,
      })
      const formattedMessage = validatedPayload.error.errors.map(error => error.message).join(', ')
      throw new ValidationError(formattedMessage, {
        issues: validatedPayload.error.issues,
        errors: validatedPayload.error.errors,
      })
    }
    console.log('[BaseZodValidation]: Validation finished successfully')
  }
}

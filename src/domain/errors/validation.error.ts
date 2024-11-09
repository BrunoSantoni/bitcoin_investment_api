export class ValidationError extends Error {
  constructor(message: string = 'Invalid data provided') {
    super(`ValidationError: ${message}`)
  }
}

export class ValidationError extends Error {
  readonly extra?: object

  constructor(message: string = 'Invalid data provided', extra?: object) {
    super(`ValidationError: ${message}`)
    this.extra = extra
  }
}

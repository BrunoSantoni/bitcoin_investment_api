export interface Validator<T> {
  validate: (input: T) => void
}

export type LogInput = {
  level: 'info' | 'error' | 'warn'
  message: string
  extra?: unknown
}

export interface Log {
  log(input: LogInput): void
}

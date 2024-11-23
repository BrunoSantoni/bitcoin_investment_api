import { HttpMethods } from '@/application/contracts/http.contract'
import { LogInput } from '@/domain/contracts/log.contract'

export type HandleRouteInput = {
  method: HttpMethods
  url: string
  middleware?: never
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  callback: Function
}

export interface BaseServer<T> {
  server: T

  listen(port: number): Promise<void>

  handleRoute(input: HandleRouteInput): void

  log(input: LogInput): void
}

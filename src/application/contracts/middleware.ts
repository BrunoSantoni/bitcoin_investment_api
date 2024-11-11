import { HttpResponse } from '@/application/contracts/http.contract'

export interface Middleware<T = never> {
  handle(request: T): Promise<HttpResponse>
}

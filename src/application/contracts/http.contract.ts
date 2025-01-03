export type HttpRequest = {
  body: never
  headers: never
  userId: string | undefined
}

export type HttpResponse = {
  status: number
  body: Record<string, unknown>
}

export enum HttpMethods {
  GET = 'get',
  POST = 'post',
  PUT = 'put',
  PATCH = 'patch',
  DELETE = 'delete',
}

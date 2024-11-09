import { HttpResponse } from '@/application/contracts/http.contract'

export const success = (data: Record<string, unknown> = {}): HttpResponse => {
  return {
    status: 200,
    body: data,
  }
}

export const created = (data: Record<string, unknown> = {}): HttpResponse => {
  return {
    status: 201,
    body: data,
  }
}

export const badRequest = (message: string = 'Data provided is not valid'): HttpResponse => {
  return {
    status: 400,
    body: {
      message,
    },
  }
}

export const serverError = (message: string = 'Unexpected error'): HttpResponse => {
  return {
    status: 500,
    body: {
      message,
    },
  }
}

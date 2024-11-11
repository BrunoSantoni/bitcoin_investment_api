import { beforeAll, beforeEach, describe, expect, it, Mocked, vi } from 'vitest'
import { AuthMiddleware } from '@/application/middlewares/auth.middleware'
import { TokenVerifier } from '@/domain/contracts/token.contract'

describe('Auth Middleware', () => {
  let sut: AuthMiddleware<{ accessToken: string }>
  let fakeTokenVerifier: Mocked<TokenVerifier>
  let fakeInput: { accessToken: string }

  beforeAll(() => {
    fakeTokenVerifier = {
      decrypt: vi.fn().mockResolvedValue('any-user-id'),
    }
    fakeInput = {
      accessToken: 'any-token',
    }
  })

  beforeEach(() => {
    vi.clearAllMocks()

    sut = new AuthMiddleware(fakeTokenVerifier)
  })

  it('should return unauthorized when not receives access token', async () => {
    const output = await sut.handle({} as never)

    expect(output).toEqual({
      status: 401,
      body: {
        message: 'Access Denied',
      },
    })
  })

  it('should return server error when tokenVerifier.decrypt throws', async () => {
    fakeTokenVerifier.decrypt.mockImplementationOnce(() => {
      throw new Error('any-error')
    })

    const output = await sut.handle(fakeInput)

    expect(output).toEqual({
      status: 500,
      body: {
        message: 'Unexpected error in Authentication Middleware',
      },
    })
  })

  it('should return ok with user id returned from decrypt on success', async () => {
    const output = await sut.handle(fakeInput)

    expect(output).toEqual({
      status: 200,
      body: {
        userId: 'any-user-id',
      },
    })
  })
})

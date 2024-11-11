import { AuthMiddleware } from '@/application/middlewares/auth.middleware'
import { JoseTokenHandler } from '@/infra/cryptography/jose-token-handler.cipher'
import { env } from '@/main/config/env'
import { Middleware } from '@/application/contracts/middleware'

export const makeAuthMiddleware = (): Middleware<{ accessToken: string }> => {
  const joseTokenHandler = new JoseTokenHandler({
    secret: env.jwtSecret,
  })
  return new AuthMiddleware<{ accessToken: string }>(joseTokenHandler)
}

import { FastifyReply, FastifyRequest } from 'fastify'
import { makeAuthMiddleware } from '@/main/factories/auth-middleware.factory'

export const authMiddleware = async (request: FastifyRequest, reply: FastifyReply) => {
  const authorizationHeader = request.headers.authorization
  if (authorizationHeader === undefined) {
    return reply.status(401).send({ error: 'No token provided' })
  }
  const [, accessToken] = authorizationHeader.split(' ')
  const authMiddleware = makeAuthMiddleware()

  const response = await authMiddleware.handle({
    accessToken,
  })

  request.userId = response.body.userId as string
}

import Fastify, { FastifyReply, FastifyRequest } from 'fastify'
import { env } from '@/main/config/env'
import { makeSignUpController } from '@/main/factories/sign-up-controller.factory'
import { makeSignInController } from '@/main/factories/sign-in-controller.factory'
import { makeAuthMiddleware } from '@/main/factories/auth-middleware.factory'
import { makeDepositController } from '@/main/factories/deposit.controller.factory'
import { DepositControllerInput } from '@/application/controllers/deposit.controller'

const authMiddleware = async (request: FastifyRequest, reply: FastifyReply) => {
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

const fastify = Fastify({
  logger: true,
})

const start = async (): Promise<void> => {
  try {
    await fastify.listen({
      port: Number(env.port),
    })
  }
  catch (error) {
    fastify.log.error(error)
    process.exit(1)
  }
}

fastify.post('/account', async (request, reply) => {
  const signUpController = makeSignUpController()

  const response = await signUpController.handle(request.body as never)

  return reply.status(response.status).send(response.body)
})

fastify.post('/login', async (request, reply) => {
  const signInController = makeSignInController()

  const response = await signInController.handle(request.body as never)

  return reply.status(response.status).send(response.body)
})

fastify.post('/account/deposit', { preHandler: authMiddleware }, async (request, reply) => {
  const depositController = makeDepositController()
  const body = request.body as DepositControllerInput

  const response = await depositController.handle({
    amount: body.amount,
    userId: request.userId as string,
  })

  return reply.status(response.status).send(response.body)
})

void start()

import Fastify, { FastifyReply, FastifyRequest } from 'fastify'
import { env } from '@/main/config/env'
import { makeSignUpController } from '@/main/factories/sign-up-controller.factory'
import { makeSignInController } from '@/main/factories/sign-in-controller.factory'
import { makeAuthMiddleware } from '@/main/factories/auth-middleware.factory'
import { makeDepositController } from '@/main/factories/deposit.controller.factory'
import { DepositControllerInput } from '@/application/controllers/deposit.controller'
import { RabbitMQQueue } from '@/infra/queue/rabbitmq.queue'
import { AsynchronousEmailSendGridWorker } from '@/main/workers/asynchronous-email.sendgrid.worker'
import { makeBalanceController } from '@/main/factories/balance.controller.factory'

const fastify = Fastify({
  logger: true,
})

const rabbitMQQueue = new RabbitMQQueue(env.rabbitMQUrl)
const asynchronousEmailWorker = new AsynchronousEmailSendGridWorker(rabbitMQQueue, env.sendGridApiKey, env.sendGridEmailSender, env.newDepositConfirmationEmailQueueName)

const start = async (): Promise<void> => {
  try {
    await rabbitMQQueue.createConnection()
    await asynchronousEmailWorker.consumeFromEmailsQueue()
    await fastify.listen({
      port: Number(env.port),
      host: '0.0.0.0',
    })
    console.log(`[Server]: Server is running at ${env.port}`)
  }
  catch (error) {
    fastify.log.error(error)
    process.exit(1)
  }
}

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
  const depositController = makeDepositController(rabbitMQQueue)
  const body = request.body as DepositControllerInput

  const response = await depositController.handle({
    amount: body.amount,
    userId: request.userId as string,
  })

  return reply.status(response.status).send(response.body)
})

fastify.get('/account/balance', { preHandler: authMiddleware }, async (request, reply) => {
  const balanceController = makeBalanceController()

  const response = await balanceController.handle({
    userId: request.userId as string,
  })

  return reply.status(response.status).send(response.body)
})

void start()

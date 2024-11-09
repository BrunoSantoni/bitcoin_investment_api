import Fastify from 'fastify'
import { env } from '@/main/config/env'
import { makeSignUpController } from '@/main/factories/sign-up-controller.factory'
import { makeSignInController } from '@/main/factories/sign-in-controller.factory'

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

void start()

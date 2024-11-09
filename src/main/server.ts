import Fastify from 'fastify'
import { env } from '@/main/config/env'
import { makeSignUpController } from '@/main/factories/sign-up-controller.factory'

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
  const controller = makeSignUpController()

  const response = await controller.handle(request.body as never)

  return reply.status(response.status).send(response.body)
})

void start()

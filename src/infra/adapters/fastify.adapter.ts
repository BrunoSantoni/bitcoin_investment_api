import { BaseServer, HandleRouteInput } from '@/infra/contracts/base-server.contract'
import Fastify, { FastifyInstance } from 'fastify'
import { LogInput } from '@/domain/contracts/log.contract'

export class FastifyAdapter implements BaseServer<FastifyInstance> {
  public readonly server: FastifyInstance

  constructor() {
    this.server = Fastify({
      logger: true,
    })
  }

  log(input: LogInput): void {
    const { level, message, extra } = input
    this.server.log[level](`${message}. Extra: ${JSON.stringify(extra)}`)
  }

  async listen(port: number): Promise<void> {
    await this.server.listen({
      port,
      host: '0.0.0.0',
    })
    console.log(`[FastifyAdapter]: Server is running at ${port}`)
  }

  handleRoute(input: HandleRouteInput): void {
    const { method, url, middleware, callback } = input
    this.server.route({
      method,
      url,
      preHandler: middleware,
      handler: async (request, reply) => {
        const output = await callback({
          body: request.body,
          headers: request.headers,
          userId: request.userId,
        })

        return reply.status(output.status).send(output.body)
      },
    })
  }
}

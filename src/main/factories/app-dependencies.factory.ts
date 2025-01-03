import { env } from '@/main/config/env'
import { ListenQueue, QueueAdapter, SendToQueue } from '@/domain/contracts/queue.contract'
import { BaseServer } from '@/infra/contracts/base-server.contract'
import { CacheAdapter, FindOnCacheByKey } from '@/domain/contracts/cache.contract'
import { FastifyAdapter } from '@/infra/adapters/fastify.adapter'
import { RabbitMQQueue } from '@/infra/queue/rabbitmq.queue'
import { RedisCache } from '@/infra/cache/redis.cache'
import { AsynchronousEmailSendGridWorker } from '@/main/workers/asynchronous-email.sendgrid.worker'
import { AsynchronousCacheSaverWorker } from '@/main/workers/asynchronous-cache-saver.worker'
import { FastifyInstance } from 'fastify'

export type AppDependenciesFactoryOutput = {
  queue: QueueAdapter
  queueSender: SendToQueue
  cache: CacheAdapter
  cacheFinderByKey: FindOnCacheByKey
  asynchronousEmailWorker: ListenQueue
  asynchronousCacheSaverWorker: ListenQueue
  httpServer: BaseServer<FastifyInstance>
}

export const makeAppDependencies = (): AppDependenciesFactoryOutput => {
  const rabbitMQQueue = new RabbitMQQueue(env.rabbitMQUrl)
  const redisCache = new RedisCache(env.cacheUrl)
  const asynchronousEmailWorker = new AsynchronousEmailSendGridWorker(rabbitMQQueue, env.sendGridApiKey, env.sendGridEmailSender, env.newDepositConfirmationEmailQueueName)
  const asynchronousCacheSaverWorker = new AsynchronousCacheSaverWorker(rabbitMQQueue, env.cacheSaverQueueName, redisCache)
  const fastifyAdapter = new FastifyAdapter()
  return {
    queue: rabbitMQQueue,
    queueSender: rabbitMQQueue,
    cache: redisCache,
    cacheFinderByKey: redisCache,
    asynchronousEmailWorker,
    asynchronousCacheSaverWorker,
    httpServer: fastifyAdapter,
  }
}

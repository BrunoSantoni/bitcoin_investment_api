import { env } from '@/main/config/env'
import { makeSignUpController } from '@/main/factories/sign-up-controller.factory'
import { makeSignInController } from '@/main/factories/sign-in-controller.factory'
import { makeDepositController } from '@/main/factories/deposit.controller.factory'
import { DepositControllerInput } from '@/application/controllers/deposit.controller'
import { makeBalanceController } from '@/main/factories/balance.controller.factory'
import { makeBTCPriceController } from '@/main/factories/btc-price.controller.factory'
import { HttpMethods, HttpRequest } from '@/application/contracts/http.contract'
import { makeAppDependencies } from '@/main/factories/app-dependencies.factory'
import { authMiddleware } from '@/infra/adapters/middlewares/fastify-auth-middleware.adapter'

const { queue, queueSender, cache, cacheFinderByKey, asynchronousEmailWorker, asynchronousCacheSaverWorker, httpServer } = makeAppDependencies()

const start = async (): Promise<void> => {
  try {
    await queue.createConnection()
    await cache.connect()
    await asynchronousEmailWorker.listenFromQueue()
    await asynchronousCacheSaverWorker.listenFromQueue()
    await httpServer.listen(Number(env.port))
  }
  catch (error) {
    await queue.closeConnection()
    await cache.disconnect()
    httpServer.log({
      level: 'error',
      message: 'Unexpected error',
      extra: error,
    })
    process.exit(1)
  }
}

httpServer.handleRoute({
  method: HttpMethods.POST,
  url: '/account',
  callback: async ({ body }: HttpRequest) => {
    httpServer.log({
      level: 'info',
      message: 'Create account route called',
    })
    const signUpController = makeSignUpController()

    const response = await signUpController.handle(body)

    return response
  },
})

httpServer.handleRoute({
  method: HttpMethods.POST,
  url: '/login',
  callback: async ({ body }: HttpRequest) => {
    const signInController = makeSignInController()

    const response = await signInController.handle(body)

    return response
  },
})

httpServer.handleRoute({
  method: HttpMethods.POST,
  url: '/account/deposit',
  middleware: authMiddleware as never,
  callback: async ({ body, userId }: HttpRequest) => {
    const depositController = makeDepositController(queueSender)
    const typedBody = body as DepositControllerInput

    const response = await depositController.handle({
      amount: typedBody.amount,
      userId: userId as string,
    })

    return response
  },
})

httpServer.handleRoute({
  method: HttpMethods.GET,
  url: '/account/balance',
  middleware: authMiddleware as never,
  callback: async ({ userId }: HttpRequest) => {
    const balanceController = makeBalanceController()

    const response = await balanceController.handle({
      userId: userId as string,
    })

    return response
  },
})

httpServer.handleRoute({
  method: HttpMethods.GET,
  url: '/btc/price',
  middleware: authMiddleware as never,
  callback: async ({ userId }: HttpRequest) => {
    const btcPriceController = makeBTCPriceController(cacheFinderByKey, queueSender)

    const response = await btcPriceController.handle({
      userId: userId as string,
    })

    return response
  },
})

void start()

export {
  httpServer,
}

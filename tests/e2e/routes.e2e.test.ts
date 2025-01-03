import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { httpServer } from '@/main/server'
import { FastifyAdapter } from '@/infra/adapters/fastify.adapter'
import { prismaClient } from '@/infra/repositories/prisma.config'
import { SignUpControllerInput } from '@/application/controllers/sign-up.controller'
import { SignInControllerInput } from '@/application/controllers/sign-in.controller'
import { BTCApi } from '@/infra/apis/btc.api'
import { AsynchronousEmailSendGridWorker } from '@/main/workers/asynchronous-email.sendgrid.worker'

// Sendgrid and Bitcoin API integrations are commented
// to prevent email / request spam, remove mock if you want to test SendGrid mail integration and http call
vi.mock('@/main/workers/asynchronous-email.sendgrid.worker')
vi.mock('@/infra/apis/btc.api')
vi.mock('@/main/config/env', () => ({
  env: {
    port: '3334',
    jwtSecret: '78ff8711f227acdbc148f93c3298d610be59b9398bd76647ce07b11f0ecae0c8',
    sendGridApiKey: 'any-key',
    sendGridEmailSender: 'invalid-sender',
    newDepositConfirmationEmailQueueName: 'test-queue',
    cacheSaverQueueName: 'test-queue',
    cacheUrl: 'redis://localhost:6379',
    rabbitMQUrl: 'amqp://localhost:5672',
    bitcoinPriceBaseApiUrl: 'invalid-url',
  },
}))

describe('Account Routes E2E test', () => {
  let sut: FastifyAdapter
  let btcApiFakePurchasePrice: number
  let btcApiFakeSellPrice: number

  beforeAll(() => {
    btcApiFakePurchasePrice = 66751.3254
    btcApiFakeSellPrice = 65250.1542

    sut = httpServer

    vi.mocked(AsynchronousEmailSendGridWorker.prototype.send).mockImplementation(() => {
      console.log('Mocked Email implementation')
      return Promise.resolve()
    })
    vi.mocked(BTCApi.prototype.obtainCurrentPrice).mockImplementation(() => {
      console.log('Mocked BTC API implementation')
      return Promise.resolve({
        purchasePrice: 66751.3254,
        salePrice: 65250.1542,
      })
    })
  })

  beforeEach(async () => {
    await prismaClient.user.deleteMany({
      where: {
        name: {
          contains: 'John Doe',
        },
      },
    })
  })

  afterAll(async () => {
    await prismaClient.user.deleteMany({
      where: {
        name: {
          contains: 'John Doe',
        },
      },
    })
  })

  const makeAccount = async (input: Partial<SignUpControllerInput>) => {
    return sut.server.inject({
      method: 'POST',
      url: '/account',
      payload: {
        name: input.name ?? 'John Doe',
        email: input.email ?? 'john@example.com',
        password: input.password ?? '12345678',
      },
    })
  }

  const makeLogin = async (input: Partial<SignInControllerInput>) => {
    return sut.server.inject({
      method: 'POST',
      url: '/login',
      payload: {
        email: input.email ?? 'john@example.com',
        password: input.password ?? '12345678',
      },
    })
  }

  const makeDeposit = async (input: { accessToken: string, amount?: number }) => {
    return sut.server.inject({
      method: 'POST',
      url: '/account/deposit',
      payload: {
        amount: input.amount ?? 10.00,
      },
      headers: {
        Authorization: `Bearer ${input.accessToken}`,
      },
    })
  }

  const makeBalance = async (input: { accessToken: string }) => {
    return sut.server.inject({
      method: 'GET',
      url: '/account/balance',
      headers: {
        Authorization: `Bearer ${input.accessToken}`,
      },
    })
  }

  const makeBTCPriceHttpCall = async (input: { accessToken: string }) => {
    return sut.server.inject({
      method: 'GET',
      url: '/btc/price',
      headers: {
        Authorization: `Bearer ${input.accessToken}`,
      },
    })
  }

  describe('POST /account', () => {
    it('should not create an account when password has less than 8 digits', async () => {
      const response = await makeAccount({
        password: '123456',
      })
      const output = JSON.parse(response.body)

      expect(response.statusCode).toBe(400)
      expect(output).toEqual({ message: 'ValidationError: Password should have at least 8 characters' })
    })

    it('should return 201 created with id on success', async () => {
      const response = await makeAccount({})
      const output = JSON.parse(response.body)

      expect(response.statusCode).toBe(201)
      expect(output).toEqual({ id: expect.any(String) })
    })
  })

  describe('POST /login', () => {
    it('should return forbidden when credentials are invalid', async () => {
      const response = await makeLogin({})
      const output = JSON.parse(response.body)

      expect(response.statusCode).toBe(401)
      expect(output).toEqual({ message: 'Invalid credentials' })
    })

    it('should login successfully', async () => {
      await makeAccount({})

      const response = await makeLogin({})
      const output = JSON.parse(response.body)

      expect(response.statusCode).toBe(200)
      expect(output).toEqual({ accessToken: expect.any(String) })
    })
  })

  describe('POST /account/deposit', () => {
    it('should return bad request when access token is invalid', async () => {
      const response = await makeDeposit({
        accessToken: 'wrong-access-token',
      })
      const output = JSON.parse(response.body)

      expect(response.statusCode).toBe(400)
      expect(output).toEqual({ message: 'ValidationError: Missing information' })
    })

    it('should return 204 no content on success', async () => {
      await makeAccount({
        email: 'brunosantoni98@gmail.com',
      })
      const loginResponse = await makeLogin({
        email: 'brunosantoni98@gmail.com',
      })

      const depositResponse = await makeDeposit({
        accessToken: JSON.parse(loginResponse.body).accessToken,
      })

      expect(depositResponse.statusCode).toBe(204)
      expect(depositResponse.body).toBe('')
    })
  })

  describe('GET /account/balance', () => {
    it('should return bad request when access token is invalid', async () => {
      const response = await makeBalance({
        accessToken: 'wrong-access-token',
      })
      const output = JSON.parse(response.body)

      expect(response.statusCode).toBe(400)
      expect(output).toEqual({ message: 'ValidationError: Missing information' })
    })

    it('should return forbidden when access token is not provided', async () => {
      const response = await sut.server.inject({
        method: 'GET',
        url: '/account/balance',
      })
      const output = JSON.parse(response.body)

      expect(response.statusCode).toBe(401)
      expect(output).toEqual({ error: 'No token provided' })
    })

    it('should return 200 with balance on success', async () => {
      await makeAccount({
        email: 'bsantoni1998@gmail.com',
      })
      const loginResponse = await makeLogin({
        email: 'bsantoni1998@gmail.com',
      })
      const accessToken = JSON.parse(loginResponse.body).accessToken
      await makeDeposit({
        accessToken,
        amount: 175.00,
      })
      await makeDeposit({
        accessToken,
        amount: 75.00,
      })

      const balanceResponse = await makeBalance({
        accessToken,
      })
      const output = JSON.parse(balanceResponse.body)

      expect(balanceResponse.statusCode).toBe(200)
      expect(output).toEqual({ balance: 250.00 })
    })
  })

  describe('GET /btc/price', () => {
    it('should return bad request when access token is invalid', async () => {
      const response = await makeBTCPriceHttpCall({
        accessToken: 'wrong-access-token',
      })
      const output = JSON.parse(response.body)

      expect(response.statusCode).toBe(400)
      expect(output).toEqual({ message: 'ValidationError: Missing information' })
    })

    it('should return 200 with balance on success', async () => {
      await makeAccount({})
      const loginResponse = await makeLogin({})
      const accessToken = JSON.parse(loginResponse.body).accessToken

      const btcPriceResponse = await makeBTCPriceHttpCall({
        accessToken,
      })
      const output = JSON.parse(btcPriceResponse.body)

      expect(btcPriceResponse.statusCode).toBe(200)
      expect(output).toEqual({ purchasePrice: Number(btcApiFakePurchasePrice.toFixed(2)), salePrice: Number(btcApiFakeSellPrice.toFixed(2)) })
    })
  })
})

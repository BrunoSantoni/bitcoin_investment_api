import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { AccountPrismaRepository } from '@/infra/repositories/account.prisma.repository'
import { prismaClient } from '@/infra/repositories/prisma.config'
import { SavedUser, User } from '@/domain/entities/user.entity'
import { userEntityInputMock } from '@/tests/domain/mocks/user.mock'

describe('Account Prisma Repository Integration', () => {
  let sut: AccountPrismaRepository
  let fakeUser: User
  let idOfNonExistentUser: string

  beforeAll(() => {
    fakeUser = new User({
      ...userEntityInputMock(),
      name: 'integration-test-any-name',
    })
    idOfNonExistentUser = '90b210ed-3520-4328-a7b0-bcdc40d6655f'
  })

  beforeEach(async () => {
    await prismaClient.user.deleteMany({
      where: {
        name: {
          contains: 'integration-test',
        },
      },
    })

    sut = new AccountPrismaRepository()
  })

  afterAll(async () => {
    await prismaClient.user.deleteMany({
      where: {
        name: {
          contains: 'integration-test',
        },
      },
    })
  })

  describe('findById', () => {
    it('should return null if no user is found with the provided id', async () => {
      const output = await sut.findById(idOfNonExistentUser)

      expect(output).toBe(null)
    })

    it('should return a saved user when found', async () => {
      const createdUser = await prismaClient.user.create({
        data: {
          name: 'integration-test-any-name',
          email: 'used@mail.com',
          password: 'any-hashed-password',
        },
        select: {
          id: true,
        },
      })
      const output = await sut.findById(createdUser.id)

      expect(output).toBeInstanceOf(SavedUser)
      expect(output?.id).toEqual(expect.any(String))
      expect(output?.name).toBe('integration-test-any-name')
      expect(output?.email).toBe('used@mail.com')
      expect(output?.password).toBe('any-hashed-password')
    })
  })

  describe('findByEmail', () => {
    it('should return null if no user is found with the provided email', async () => {
      const output = await sut.findByEmail('unused@mail.com')

      expect(output).toBe(null)
    })

    it('should return a saved user when found', async () => {
      await prismaClient.user.create({
        data: {
          name: 'integration-test-any-name',
          email: 'used@mail.com',
          password: 'any-hashed-password',
          balance: 50000,
        },
      })
      const output = await sut.findByEmail('used@mail.com')

      expect(output).toBeInstanceOf(SavedUser)
      expect(output?.id).toEqual(expect.any(String))
      expect(output?.name).toBe('integration-test-any-name')
      expect(output?.email).toBe('used@mail.com')
      expect(output?.password).toBe('any-hashed-password')
      expect(output?.balanceInCents).toBe(50000)
    })
  })

  describe('create', () => {
    it('should create a new saved user on success', async () => {
      const output = await sut.create(fakeUser)

      expect(output).toBeInstanceOf(SavedUser)
      expect(output.id).toEqual(expect.any(String))
      expect(output.name).toBe(fakeUser.name)
      expect(output.email).toBe(fakeUser.email)
      expect(output.password).toBe(fakeUser.password)
      expect(output.balanceInCents).toBe(0)
    })
  })

  describe('updateBalance', () => {
    it('should return null if no user is found with the provided id', async () => {
      const output = await sut.updateBalance({
        userId: idOfNonExistentUser,
        amountInCents: 10000,
        type: 'deposit',
      })

      expect(output).toBe(null)
    })

    it('should throw when type is withdraw but user does not have enough funds', async () => {
      const createdUser = await prismaClient.user.create({
        data: {
          name: 'integration-test-any-name',
          email: 'used@mail.com',
          password: 'any-hashed-password',
          balance: 9000,
        },
        select: {
          id: true,
        },
      })

      const promise = sut.updateBalance({
        userId: createdUser.id,
        amountInCents: 10000,
        type: 'withdraw',
      })

      expect(promise).rejects.toThrow(new Error('Cannot withdraw the request amount'))
    })

    it('should update balance on success', async () => {
      const createdUser = await prismaClient.user.create({
        data: {
          name: 'integration-test-any-name-2',
          email: 'used@mail.com',
          password: 'any-hashed-password',
          balance: 9000,
        },
        select: {
          id: true,
        },
      })

      const output = await sut.updateBalance({
        userId: createdUser.id,
        amountInCents: 10000,
        type: 'deposit',
      })

      expect(output?.balanceInCents).toBe(19000)
    })
  })
})

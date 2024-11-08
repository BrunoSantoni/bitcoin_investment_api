import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { AccountPrismaRepository } from '@/infra/repositories/account.prisma.repository'
import { prismaClient } from '@/infra/repositories/prisma.config'
import { SavedUser, User } from '@/domain/entities/user.entity'
import { userEntityInputMock } from '@/tests/domain/mocks/user.mock'

describe('Account Prisma Repository Integration', () => {
  let sut: AccountPrismaRepository
  let fakeUser: User

  beforeAll(() => {
    fakeUser = new User(userEntityInputMock())
  })

  beforeEach(async () => {
    await prismaClient.user.deleteMany({})

    sut = new AccountPrismaRepository()
  })

  afterAll(async () => {
    await prismaClient.user.deleteMany({})
  })

  describe('findByEmail', () => {
    it('should return null if no user is found with the provided email', async () => {
      const output = await sut.findByEmail('unused@mail.com')

      expect(output).toBe(null)
    })

    it('should return a saved user when found', async () => {
      await prismaClient.user.create({
        data: {
          name: 'any-name',
          email: 'used@mail.com',
          password: 'any-hashed-password',
        },
      })
      const output = await sut.findByEmail('used@mail.com')

      expect(output).toBeInstanceOf(SavedUser)
      expect(output?.id).toEqual(expect.any(String))
      expect(output?.name).toBe('any-name')
      expect(output?.email).toBe('used@mail.com')
      expect(output?.password).toBe('any-hashed-password')
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
    })
  })
})

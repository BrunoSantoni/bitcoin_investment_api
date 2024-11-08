import { beforeAll, beforeEach, describe, expect, it, Mocked, vi } from 'vitest'
import { UserSignUpService } from '@/domain/services/user-sign-up.service'
import { Encrypt } from '@/domain/contracts/cipher.contract'
import { CreateAccount, FindUserAccountByEmail } from '@/domain/contracts/account-actions.contract'
import { SavedUser, SavedUserInput, User } from '@/domain/entities/user.entity'
import { UserSignUpInput } from '@/domain/contracts/user-sign-up.contract'
import { userSignUpInputMock } from '@/tests/domain/mocks/user.mock'

describe('UserSignUpService', () => {
  let sut: UserSignUpService
  let fakeInput: UserSignUpInput
  let fakeHashedPassword: string
  let fakeEncrypter: Mocked<Encrypt>
  let createAccountFakeRepository: Mocked<CreateAccount>
  let findUserAccountByEmailFakeRepository: Mocked<FindUserAccountByEmail>
  let fakeUser: SavedUser

  beforeAll(() => {
    fakeInput = userSignUpInputMock()
    fakeUser = makeSavedUser()

    fakeHashedPassword = 'any-hashed-value'

    fakeEncrypter = {
      hash: vi.fn().mockReturnValue(fakeHashedPassword),
    }
    createAccountFakeRepository = {
      create: vi.fn().mockResolvedValue(fakeUser),
    }
    findUserAccountByEmailFakeRepository = {
      findByEmail: vi.fn().mockResolvedValue(null),
    }
  })

  beforeEach(() => {
    vi.clearAllMocks()

    sut = new UserSignUpService(createAccountFakeRepository, findUserAccountByEmailFakeRepository, fakeEncrypter)
  })

  const makeSavedUser = (params?: Partial<SavedUserInput>): SavedUser => {
    return new SavedUser({
      name: params?.name ?? fakeInput.name,
      email: params?.email ?? fakeInput.email,
      hashedPassword: params?.hashedPassword ?? 'any-hashed-value',
      id: params?.id ?? 'any-id',
    })
  }

  it('should call findUserAccountByEmailRepository.findByEmail with received email', async () => {
    await sut.handle(fakeInput)

    expect(findUserAccountByEmailFakeRepository.findByEmail).toHaveBeenCalledWith('any@mail.com')
    expect(fakeEncrypter.hash).toHaveBeenCalledTimes(1)
  })

  it('should return false when an account with provided email already exists', async () => {
    const existingUser = makeSavedUser({
      email: 'existing@mail.com',
      id: 'existing-id',
    })
    findUserAccountByEmailFakeRepository.findByEmail.mockResolvedValueOnce(existingUser)

    const output = await sut.handle(fakeInput)

    expect(output).toBe(false)
  })

  it('should rethrow when findUserAccountByEmailRepository.findByEmail throws', async () => {
    findUserAccountByEmailFakeRepository.findByEmail.mockRejectedValueOnce(new Error('any-error'))

    const promise = sut.handle(fakeInput)

    expect(() => promise).rejects.toThrow()
  })

  it('should call encrypter.hash with received password', async () => {
    await sut.handle(fakeInput)

    expect(fakeEncrypter.hash).toHaveBeenCalledWith('any-value')
    expect(fakeEncrypter.hash).toHaveBeenCalledTimes(1)
  })

  it('should rethrow when encrypter.hash throws', async () => {
    fakeEncrypter.hash.mockImplementationOnce(() => {
      throw new Error('any-error')
    })

    const promise = sut.handle(fakeInput)

    expect(() => promise).rejects.toThrow()
  })

  it('should call createAccountRepository.create with an instance of User', async () => {
    const expectedUser = new User({
      name: fakeInput.name,
      email: fakeInput.email,
      hashedPassword: fakeHashedPassword,
    })
    await sut.handle(fakeInput)

    expect(createAccountFakeRepository.create).toHaveBeenCalledWith(expectedUser)
    expect(createAccountFakeRepository.create).toHaveBeenCalledTimes(1)
  })

  it('should rethrow when createAccountRepository.create throws', async () => {
    createAccountFakeRepository.create.mockRejectedValueOnce(new Error('any-error'))

    const promise = sut.handle(fakeInput)

    expect(() => promise).rejects.toThrow()
  })

  it('should return true when user is successfully created', async () => {
    const output = await sut.handle(fakeInput)

    expect(output).toBe(true)
  })
})

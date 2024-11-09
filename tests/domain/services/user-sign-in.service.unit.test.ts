import { beforeAll, beforeEach, describe, expect, it, Mocked, vi } from 'vitest'
import { CipherCompare } from '@/domain/contracts/cipher.contract'
import { FindUserAccountByEmail } from '@/domain/contracts/account-actions.contract'
import { SavedUser } from '@/domain/entities/user.entity'
import { userEntityInputMock, userSignInInputMock } from '@/tests/domain/mocks/user.mock'
import { UserSignInService } from '@/domain/services/user-sign-in.service'
import { UserSignInInput } from '@/domain/contracts/user-sign-in.contract'
import { TokenGenerator } from '@/domain/contracts/token.contract'

describe('User SignIn Service', () => {
  let sut: UserSignInService
  let fakeInput: UserSignInInput
  let fakeSavedUser: SavedUser
  let findUserAccountByEmailFakeRepository: Mocked<FindUserAccountByEmail>
  let fakeCipherCompare: Mocked<CipherCompare>
  let fakeTokenGenerator: Mocked<TokenGenerator>

  beforeAll(() => {
    fakeInput = userSignInInputMock()

    fakeSavedUser = new SavedUser({
      ...userEntityInputMock(),
      email: 'valid@mail.com',
      id: 'any-id',
    })

    findUserAccountByEmailFakeRepository = {
      findByEmail: vi.fn().mockResolvedValue(fakeSavedUser),
    }
    fakeCipherCompare = {
      verify: vi.fn().mockReturnValue(true),
    }
    fakeTokenGenerator = {
      encrypt: vi.fn().mockResolvedValue('encrypted-token'),
    }
  })

  beforeEach(() => {
    vi.clearAllMocks()

    sut = new UserSignInService(findUserAccountByEmailFakeRepository, fakeCipherCompare, fakeTokenGenerator)
  })

  it('should call findUserAccountByEmailRepository.findByEmail with received email', async () => {
    await sut.handle(fakeInput)

    expect(findUserAccountByEmailFakeRepository.findByEmail).toHaveBeenCalledWith('valid@mail.com')
    expect(findUserAccountByEmailFakeRepository.findByEmail).toHaveBeenCalledTimes(1)
  })

  it('should return success = false with generic message when an account with provided email does not exists', async () => {
    findUserAccountByEmailFakeRepository.findByEmail.mockResolvedValueOnce(null)

    const output = await sut.handle(fakeInput)

    expect(output).toEqual({
      success: false,
      data: {
        message: 'Invalid credentials',
      },
    })
  })

  it('should rethrow when findUserAccountByEmailRepository.findByEmail throws', async () => {
    findUserAccountByEmailFakeRepository.findByEmail.mockRejectedValueOnce(new Error('any-error'))

    const promise = sut.handle(fakeInput)

    expect(() => promise).rejects.toThrow()
  })

  it('should call cipherCompare.verify with received password and hashed password returned from the database', async () => {
    await sut.handle(fakeInput)

    expect(fakeCipherCompare.verify).toHaveBeenCalledWith({
      plainText: 'any-password',
      hashedText: 'any-hashed-password',
    })
    expect(fakeCipherCompare.verify).toHaveBeenCalledTimes(1)
  })

  it('should return success = false with generic message when password does not match', async () => {
    fakeCipherCompare.verify.mockReturnValueOnce(false)

    const output = await sut.handle(fakeInput)

    expect(output).toEqual({
      success: false,
      data: {
        message: 'Invalid credentials',
      },
    })
  })

  it('should rethrow when cipherCompare.verify throws', async () => {
    fakeCipherCompare.verify.mockImplementationOnce(() => {
      throw new Error('any-error')
    })

    const promise = sut.handle(fakeInput)

    expect(() => promise).rejects.toThrow()
  })

  it('should call tokenGenerator.encrypt with user account id', async () => {
    await sut.handle(fakeInput)

    expect(fakeTokenGenerator.encrypt).toHaveBeenCalledWith({
      userId: 'any-id',
    })
    expect(fakeTokenGenerator.encrypt).toHaveBeenCalledTimes(1)
  })

  it('should rethrow when tokenGenerator.encrypt throws', async () => {
    fakeTokenGenerator.encrypt.mockRejectedValueOnce(new Error('any-error'))

    const promise = sut.handle(fakeInput)

    expect(() => promise).rejects.toThrow()
  })

  it('should return true with access token on success', async () => {
    const output = await sut.handle(fakeInput)

    expect(output).toEqual({
      success: true,
      data: {
        accessToken: 'encrypted-token',
      },
    })
  })
})

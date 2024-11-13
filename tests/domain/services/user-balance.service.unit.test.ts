import { beforeAll, beforeEach, describe, expect, it, Mocked, vi } from 'vitest'
import { FindUserAccountById } from '@/domain/contracts/account-actions.contract'
import { SavedUser } from '@/domain/entities/user.entity'
import { userEntityInputMock } from '@/tests/domain/mocks/user.mock'
import { UserBalanceInput } from '@/domain/contracts/user-balance.contract'
import { UserBalanceService } from '@/domain/services/user-balance.service'

describe('User Balance Service', () => {
  let sut: UserBalanceService
  let fakeInput: UserBalanceInput
  let fakeSavedUser: SavedUser
  let findUserAccountByIdFakeRepository: Mocked<FindUserAccountById>

  beforeAll(() => {
    fakeInput = {
      userId: 'any-id',
    }

    fakeSavedUser = new SavedUser({
      ...userEntityInputMock(),
      balanceInCents: 15090,
      email: 'valid@mail.com',
      id: 'any-id',
    })

    findUserAccountByIdFakeRepository = {
      findById: vi.fn().mockResolvedValue(fakeSavedUser),
    }
  })

  beforeEach(() => {
    vi.clearAllMocks()

    sut = new UserBalanceService(
      findUserAccountByIdFakeRepository,
    )
  })

  it('should call findUserAccountByIdRepository.findById with received user id', async () => {
    await sut.handle(fakeInput)

    expect(findUserAccountByIdFakeRepository.findById).toHaveBeenCalledWith('any-id')
    expect(findUserAccountByIdFakeRepository.findById).toHaveBeenCalledTimes(1)
  })

  it('should return success = false when an account is not found', async () => {
    findUserAccountByIdFakeRepository.findById.mockResolvedValueOnce(null)

    const output = await sut.handle(fakeInput)

    expect(output).toEqual(
      {
        success: false,
        data: {
          message: 'Account not found',
        },
      },
    )
  })

  it('should rethrow when findUserAccountByIdRepository.findById throws', async () => {
    findUserAccountByIdFakeRepository.findById.mockRejectedValueOnce(new Error('any-error'))

    const promise = sut.handle(fakeInput)

    expect(() => promise).rejects.toThrow()
  })

  it('should return converted balance to BRL on success', async () => {
    const output = await sut.handle(fakeInput)

    expect(output).toEqual({
      success: true,
      data: {
        balance: 150.90,
      },
    })
  })
})

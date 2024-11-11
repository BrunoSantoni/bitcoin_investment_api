import { beforeAll, beforeEach, describe, expect, it, Mocked, vi } from 'vitest'
import { FindUserAccountById, UpdateUserBalance } from '@/domain/contracts/account-actions.contract'
import { SavedUser } from '@/domain/entities/user.entity'
import { userEntityInputMock } from '@/tests/domain/mocks/user.mock'
import { UserDepositService } from '@/domain/services/user-deposit.service'
import { UserDepositInput } from '@/domain/contracts/user-deposit.contract'
import { SendConfirmationMailToUser } from '@/domain/contracts/mail.contract'

describe('User Deposit Service', () => {
  let sut: UserDepositService
  let fakeInput: UserDepositInput
  let fakeSavedUser: SavedUser
  let findUserAccountByIdFakeRepository: Mocked<FindUserAccountById>
  let fakeUpdateUserBalanceRepository: Mocked<UpdateUserBalance>
  let fakeSendConfirmationEmailToUserSdk: Mocked<SendConfirmationMailToUser>

  beforeAll(() => {
    fakeInput = {
      amount: 100,
      userId: 'any-id',
    }

    fakeSavedUser = new SavedUser({
      ...userEntityInputMock(),
      email: 'valid@mail.com',
      id: 'any-id',
    })

    findUserAccountByIdFakeRepository = {
      findById: vi.fn().mockResolvedValue(fakeSavedUser),
    }
    fakeUpdateUserBalanceRepository = {
      updateBalance: vi.fn().mockResolvedValue(fakeSavedUser),
    }
    fakeSendConfirmationEmailToUserSdk = {
      send: vi.fn().mockResolvedValue(true),
    }
  })

  beforeEach(() => {
    vi.clearAllMocks()

    sut = new UserDepositService(findUserAccountByIdFakeRepository, fakeUpdateUserBalanceRepository, fakeSendConfirmationEmailToUserSdk)
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

  it('should call updateUserBalanceRepository.updateBalance with correct params', async () => {
    await sut.handle(fakeInput)

    expect(fakeUpdateUserBalanceRepository.updateBalance).toHaveBeenCalledWith({
      userId: 'any-id',
      amountInCents: 10000,
      type: 'deposit',
    })
    expect(fakeUpdateUserBalanceRepository.updateBalance).toHaveBeenCalledTimes(1)
  })

  it('should rethrow when updateUserBalanceRepository.updateBalance throws', async () => {
    fakeUpdateUserBalanceRepository.updateBalance.mockImplementationOnce(() => {
      throw new Error('any-error')
    })

    const promise = sut.handle(fakeInput)

    expect(() => promise).rejects.toThrow()
  })

  it('should call sendConfirmationEmailToUserSdk.send with correct params', async () => {
    await sut.handle(fakeInput)

    expect(fakeSendConfirmationEmailToUserSdk.send).toHaveBeenCalledWith({
      userEmail: 'valid@mail.com',
      subject: 'Test API - Deposit of R$100 to any-name',
      text: 'The requested amount was deposited in your account. This is a email sent from a technical test, and its not real money',
    })
    expect(fakeSendConfirmationEmailToUserSdk.send).toHaveBeenCalledTimes(1)
  })

  // TODO: Change this test when async implementation of email is made
  it('should call console warn when sendConfirmationEmailToUserSdk.send throws', async () => {
    const warnSpy = vi.spyOn(console, 'warn')

    fakeSendConfirmationEmailToUserSdk.send.mockResolvedValueOnce(false)

    await sut.handle(fakeInput)

    expect(warnSpy).toHaveBeenCalledWith('[UserDepositService]: Confirmation mail was not sent to user')
    expect(warnSpy).toHaveBeenCalledTimes(1)
  })

  it('should rethrow when sendConfirmationEmailToUserSdk.send throws', async () => {
    fakeSendConfirmationEmailToUserSdk.send.mockRejectedValueOnce(new Error('any-error'))

    const promise = sut.handle(fakeInput)

    expect(() => promise).rejects.toThrow()
  })

  it('should return true on success', async () => {
    const output = await sut.handle(fakeInput)

    expect(output).toEqual({
      success: true,
    })
  })
})

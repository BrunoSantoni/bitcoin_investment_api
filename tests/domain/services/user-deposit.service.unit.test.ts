import { beforeAll, beforeEach, describe, expect, it, Mocked, vi } from 'vitest'
import { FindUserAccountById, UpdateUserBalance } from '@/domain/contracts/account-actions.contract'
import { SavedUser } from '@/domain/entities/user.entity'
import { userEntityInputMock } from '@/tests/domain/mocks/user.mock'
import { UserDepositService } from '@/domain/services/user-deposit.service'
import { UserDepositInput } from '@/domain/contracts/user-deposit.contract'
import { SendToQueue } from '@/domain/contracts/queue.contract'

describe('User Deposit Service', () => {
  let sut: UserDepositService
  let fakeEmailQueueName: string
  let fakeInput: UserDepositInput
  let fakeSavedUser: SavedUser
  let findUserAccountByIdFakeRepository: Mocked<FindUserAccountById>
  let fakeUpdateUserBalanceRepository: Mocked<UpdateUserBalance>
  let fakeSendConfirmationEmailToQueue: Mocked<SendToQueue>

  beforeAll(() => {
    fakeEmailQueueName = 'any-queue-name'

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
    fakeSendConfirmationEmailToQueue = {
      sendToQueue: vi.fn(),
    }
  })

  beforeEach(() => {
    vi.clearAllMocks()

    sut = new UserDepositService(
      findUserAccountByIdFakeRepository,
      fakeUpdateUserBalanceRepository,
      fakeSendConfirmationEmailToQueue,
      fakeEmailQueueName,
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

  it('should call sendConfirmationEmailToQueue.sendToQueue with correct message', async () => {
    const expectedOutputMessage = JSON.stringify({
      userEmail: 'valid@mail.com',
      subject: 'Test API - Test deposit has been made',
      text: 'Hello any-name, the deposit of R$100 was successfully made. This is a email sent from a technical test for a company, and its not real money',
    })

    await sut.handle(fakeInput)

    expect(fakeSendConfirmationEmailToQueue.sendToQueue).toHaveBeenCalledWith({
      queueName: 'any-queue-name',
      message: expectedOutputMessage,
    })
    expect(fakeSendConfirmationEmailToQueue.sendToQueue).toHaveBeenCalledTimes(1)
  })

  it('should rethrow when sendConfirmationEmailToQueue.sendToQueue throws', async () => {
    fakeSendConfirmationEmailToQueue.sendToQueue.mockRejectedValueOnce(new Error('any-error'))

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

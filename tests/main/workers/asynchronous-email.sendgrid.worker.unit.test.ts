import { beforeAll, beforeEach, describe, expect, it, Mock, Mocked, vi } from 'vitest'
import { AsynchronousEmailSendGridWorker } from '@/main/workers/asynchronous-email.sendgrid.worker'
import { SendConfirmationMailToUserInput } from '@/domain/contracts/mail.contract'
import sendGridSdk from '@sendgrid/mail'
import { ConsumeQueue } from '@/domain/contracts/queue.contract'

vi.mock('@sendgrid/mail')

describe('Asynchronous Email Sendgrid Worker', () => {
  let sut: AsynchronousEmailSendGridWorker
  let fakeQueueConsumer: Mocked<ConsumeQueue>
  let fakeInput: SendConfirmationMailToUserInput
  let fakeSendGridApiKey: string
  let fakeSender: string
  let fakeQueueName: string
  let sendGridSendMock: Mock

  beforeAll(() => {
    fakeQueueConsumer = {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      consumeMessage: vi.fn().mockImplementation(async (queueName: string, handler: (message: any) => void) => {
        await handler(JSON.stringify(fakeInput))
      }),
    }
    fakeInput = {
      userEmail: 'any@mail.com',
      subject: 'any-subject',
      text: 'any-text',
    }
    fakeSendGridApiKey = 'any-api-key'
    fakeSender = 'any-sender'
    fakeQueueName = 'any-queue-name'

    sendGridSendMock = vi.mocked(sendGridSdk.send).mockImplementation(() => Promise.resolve(true) as never)
  })

  beforeEach(() => {
    vi.clearAllMocks()

    sut = new AsynchronousEmailSendGridWorker(fakeQueueConsumer, fakeSendGridApiKey, fakeSender, fakeQueueName)
  })

  describe('listenFromQueue', () => {
    it('should call AsynchronousEmailSendGridWorker.send with correct params', async () => {
      const sendSpy = vi.spyOn(AsynchronousEmailSendGridWorker.prototype, 'send')

      await sut.listenFromQueue()

      expect(sendSpy).toHaveBeenCalledWith(fakeInput)
      expect(sendSpy).toHaveBeenCalledTimes(1)
    })
  })

  describe('send', () => {
    it('should call sendGridSdk.send with correct message template', async () => {
      await sut.send(fakeInput)

      expect(sendGridSendMock).toHaveBeenCalledWith({
        to: fakeInput.userEmail,
        from: fakeSender,
        subject: fakeInput.subject,
        text: fakeInput.text,
        html: `<strong>${fakeInput.text}</strong>`,
      })
      expect(sendGridSendMock).toHaveBeenCalledTimes(1)
    })

    it('should rethrow when sendGridSdk throws', async () => {
      sendGridSendMock.mockRejectedValueOnce(new Error('any-error'))

      const promise = sut.send(fakeInput)

      expect(promise).rejects.toThrow(new Error('any-error'))
    })

    it('should not throw on success', async () => {
      const promise = sut.send(fakeInput)

      expect(promise).resolves.toBeUndefined()
    })
  })
})

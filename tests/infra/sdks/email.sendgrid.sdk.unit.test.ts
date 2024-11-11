import { beforeAll, beforeEach, describe, expect, it, Mock, vi } from 'vitest'
import { EmailSendGridSdk } from '@/infra/sdks/email.sendgrid.sdk'
import { SendConfirmationMailToUserInput } from '@/domain/contracts/mail.contract'
import sendGridSdk from '@sendgrid/mail'

vi.mock('@sendgrid/mail')

describe('Email SendGrid SDK', () => {
  let sut: EmailSendGridSdk
  let fakeInput: SendConfirmationMailToUserInput
  let fakeSendGridApiKey: string
  let fakeSender: string
  let sendGridSendMock: Mock

  beforeAll(() => {
    fakeInput = {
      userEmail: 'any@mail.com',
      subject: 'any-subject',
      text: 'any-text',
    }
    fakeSendGridApiKey = 'any-api-key'
    fakeSender = 'any-sender'

    sendGridSendMock = vi.mocked(sendGridSdk.send).mockImplementation(() => Promise.resolve(true) as never)
  })

  beforeEach(() => {
    vi.clearAllMocks()

    sut = new EmailSendGridSdk(fakeSendGridApiKey, fakeSender)
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

    it('should return false when sendGridSdk throws', async () => {
      sendGridSendMock.mockRejectedValueOnce(new Error('any-error'))

      const output = await sut.send(fakeInput)

      expect(output).toBe(false)
    })

    it('should return true on success', async () => {
      const output = await sut.send(fakeInput)

      expect(output).toBe(true)
    })
  })
})

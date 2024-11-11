import sendGridSdk from '@sendgrid/mail'
import { SendConfirmationMailToUser, SendConfirmationMailToUserInput } from '@/domain/contracts/mail.contract'

export class EmailSendGridSdk implements SendConfirmationMailToUser {
  constructor(private readonly sendGridApiKey: string, private readonly sender: string) {
    sendGridSdk.setApiKey(this.sendGridApiKey)
  }

  async send(input: SendConfirmationMailToUserInput): Promise<boolean> {
    try {
      const { userEmail, subject, text } = input

      const messageTemplate = {
        to: userEmail,
        from: this.sender,
        subject,
        text,
        html: `<strong>${text}</strong>`,
      }

      await sendGridSdk.send(messageTemplate)

      return true
    }
    catch {
      return false
    }
  }
}

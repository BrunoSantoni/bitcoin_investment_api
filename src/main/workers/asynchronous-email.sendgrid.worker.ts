import sendGridSdk from '@sendgrid/mail'
import { SendConfirmationMailToUser, SendConfirmationMailToUserInput } from '@/domain/contracts/mail.contract'
import { ConsumeQueue, ListenQueue } from '@/domain/contracts/queue.contract'

export class AsynchronousEmailSendGridWorker implements SendConfirmationMailToUser, ListenQueue {
  constructor(
    private readonly queueConsumer: ConsumeQueue,
    private readonly sendGridApiKey: string,
    private readonly sender: string,
    private readonly queueName: string,
  ) {
    sendGridSdk.setApiKey(this.sendGridApiKey)
  }

  async listenFromQueue(): Promise<void> {
    this.queueConsumer.consumeMessage(this.queueName, async (message: string) => {
      console.log('[AsynchronousEmailSendGridWorker.consumeFromQueue]: Message received', message)
      const parsedMessage: SendConfirmationMailToUserInput = JSON.parse(message)

      await this.send({
        userEmail: parsedMessage.userEmail,
        subject: parsedMessage.subject,
        text: parsedMessage.text,
      })

      console.log('[AsynchronousEmailSendGridWorker.consumeFromQueue]: Confirmation email sent', message)
    })
  }

  async send(input: SendConfirmationMailToUserInput): Promise<void> {
    const { userEmail, subject, text } = input

    const messageTemplate = {
      to: userEmail,
      from: this.sender,
      subject,
      text,
      html: `<strong>${text}</strong>`,
    }

    await sendGridSdk.send(messageTemplate)
  }
}

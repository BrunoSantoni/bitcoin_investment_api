export type SendConfirmationMailToUserInput = {
  userEmail: string
  subject: string
  text: string
}

export interface SendConfirmationMailToUser {
  send(input: SendConfirmationMailToUserInput): Promise<boolean>
}

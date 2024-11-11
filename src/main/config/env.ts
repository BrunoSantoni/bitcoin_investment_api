import 'dotenv/config'

type EnvironmentVariables = {
  port: string
  jwtSecret: string
  sendGridApiKey: string
  sendGridEmailSender: string
  newDepositConfirmationEmailQueueName: string
  rabbitMQUrl: string
}

export const env: EnvironmentVariables = {
  port: process.env.PORT ?? '3333',
  jwtSecret: process.env.JWT_SECRET ?? '78ff8711f227acdbc148f93c3298d610be59b9398bd76647ce07b11f0ecae0c8',
  sendGridApiKey: process.env.SENDGRID_API_KEY as string,
  sendGridEmailSender: process.env.SENDGRID_EMAIL_SENDER as string,
  newDepositConfirmationEmailQueueName: process.env.NEW_DEPOSIT_CONFIRMATION_EMAIL_QUEUE_NAME ?? 'new-deposit-confirmation-email-queue',
  rabbitMQUrl: process.env.RABBITMQ_URL ?? 'amqp://localhost:5672',
}

export type SendToQueueInput = {
  queueName: string
  message: string
}

export interface SendToQueue {
  sendToQueue(input: SendToQueueInput): Promise<void>
}

export interface ConsumeQueue {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  consumeMessage(queueName: string, handler: (message: any) => void): void
}

export interface QueueAdapter {
  createConnection(): Promise<void>
}

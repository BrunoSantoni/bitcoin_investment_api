import amqp, { Channel, Connection } from 'amqplib'
import { ConsumeQueue, QueueAdapter, SendToQueue, SendToQueueInput } from '@/domain/contracts/queue.contract'

export class RabbitMQQueue implements QueueAdapter, SendToQueue, ConsumeQueue {
  private connection?: Connection
  private channel?: Channel

  constructor(private readonly url: string) {}

  async createConnection() {
    try {
      console.log('[RabbitMQQueue.connect]: Starting Rabbit connection')
      this.connection = await amqp.connect(this.url)
      this.channel = await this.connection.createChannel()
    }
    catch (error) {
      console.error('[RabbitMQQueue.connect]: Error when creating connection to RabbitMQ')
      throw error
    }
  }

  async sendToQueue(input: SendToQueueInput): Promise<void> {
    const { queueName, message } = input

    if (this.channel === undefined) {
      await this.createConnection()
    }

    this.channel?.assertQueue(queueName, { durable: true })
    this.channel?.sendToQueue(queueName, Buffer.from(message), { persistent: true })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  consumeMessage(queueName: string, handler: (message: any) => void): void {
    if (this.channel === undefined) {
      throw new Error('RabbitMQ channel is not initialized')
    }
    this.channel?.assertQueue(queueName, { durable: true })
    this.channel?.consume(queueName, async (message) => {
      if (message) {
        await handler(message.content.toString())
        this.channel?.ack(message)
      }
    })
  }
}

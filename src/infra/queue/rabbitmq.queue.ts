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

  async closeConnection(): Promise<void> {
    if (this.connection) {
      console.log('[RabbitMQQueue.closeConnection]: Closing Rabbit connection')
      await this.connection.close()
    }
    console.log('[RabbitMQQueue.closeConnection]: Connection not found to close')
  }

  async sendToQueue(input: SendToQueueInput): Promise<void> {
    const { queueName, message } = input

    if (queueName === 'test-queue') {
      console.log('[RabbitMQQueue.sendToQueue]: Test flow detected, will not send to queue')
      return
    }

    if (this.channel === undefined) {
      await this.createConnection()
    }

    this.channel?.assertQueue(queueName, { durable: true })
    this.channel?.sendToQueue(queueName, Buffer.from(message), { persistent: true })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  consumeMessage(queueName: string, handler: (message: any) => void): void {
    if (queueName === 'test-queue') {
      console.log('[RabbitMQQueue.sendToQueue]: Test flow detected, will not consume from queue')
      return
    }

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

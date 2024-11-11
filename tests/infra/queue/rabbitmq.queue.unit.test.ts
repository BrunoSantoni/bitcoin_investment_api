import { beforeAll, beforeEach, describe, expect, it, Mock, vi } from 'vitest'
import { RabbitMQQueue } from '@/infra/queue/rabbitmq.queue'
import amqp from 'amqplib'
import { SendToQueueInput } from '@/domain/contracts/queue.contract'

vi.mock('amqplib')

describe('RabbitMQ Queue', () => {
  let sut: RabbitMQQueue
  let fakeUrl: string
  let fakeSendToQueueInput: SendToQueueInput
  let mockConnect: Mock
  let mockCreateChannel: Mock
  let mockAssertQueue: Mock
  let mockConsume: Mock
  let mockAck: Mock
  let mockSendToQueue: Mock

  beforeAll(() => {
    fakeUrl = 'any-url'
    fakeSendToQueueInput = {
      message: 'any-message',
      queueName: 'any-queue',
    }
    mockConsume = vi.fn().mockImplementation((queue, callback) => {
      callback({ content: Buffer.from('any-message') })
    })
    mockAck = vi.fn()
    mockSendToQueue = vi.fn().mockResolvedValue(true)
    mockAssertQueue = vi.fn().mockResolvedValue(true)
    mockCreateChannel = vi.fn().mockResolvedValue({
      assertQueue: mockAssertQueue,
      consume: mockConsume,
      sendToQueue: mockSendToQueue,
      ack: mockAck,
    })
    mockConnect = vi.fn().mockResolvedValue({
      createChannel: mockCreateChannel,
    })

    amqp.connect = mockConnect
  })

  beforeEach(async () => {
    vi.clearAllMocks()

    sut = new RabbitMQQueue(fakeUrl)

    await sut.createConnection()
  })

  describe('createConnection', () => {
    it('should create connection', async () => {
      expect(mockConnect).toHaveBeenCalledWith(fakeUrl)
      expect(mockConnect).toHaveBeenCalledTimes(1)
      expect(mockCreateChannel).toHaveBeenCalled()
      expect(mockCreateChannel).toHaveBeenCalledTimes(1)
    })

    it('should throw on error', async () => {
      mockConnect.mockRejectedValueOnce(new Error('any-error'))

      const promise = sut.createConnection()

      expect(promise).rejects.toThrow()
    })
  })

  describe('sendToQueue', () => {
    it('should send a message to the queue', async () => {
      await sut.sendToQueue(fakeSendToQueueInput)

      expect(mockAssertQueue).toHaveBeenCalledWith(fakeSendToQueueInput.queueName, { durable: true })
      expect(mockAssertQueue).toHaveBeenCalledTimes(1)
      expect(mockSendToQueue).toHaveBeenCalledWith(fakeSendToQueueInput.queueName, Buffer.from(fakeSendToQueueInput.message), { persistent: true })
      expect(mockSendToQueue).toHaveBeenCalledTimes(1)
    })

    it('should call createConnection when channel is undefined', async () => {
      sut['channel'] = undefined
      await sut.sendToQueue(fakeSendToQueueInput)

      expect(mockConnect).toHaveBeenCalledWith(fakeUrl)
      expect(mockConnect).toHaveBeenCalledTimes(2)
      expect(mockCreateChannel).toHaveBeenCalled()
      expect(mockCreateChannel).toHaveBeenCalledTimes(2)
    })
  })

  describe('consumeMessage', () => {
    let fakeHandler: Mock

    beforeAll(() => {
      fakeHandler = vi.fn()
    })

    it('should call channel.assertQueue and channel.consume with correct params', () => {
      sut.consumeMessage(fakeSendToQueueInput.queueName, fakeHandler)

      expect(mockAssertQueue).toHaveBeenCalledWith(fakeSendToQueueInput.queueName, { durable: true })
      expect(mockAssertQueue).toHaveBeenCalledTimes(1)
      expect(mockConsume).toHaveBeenCalledWith(fakeSendToQueueInput.queueName, expect.any(Function))
      expect(mockConsume).toHaveBeenCalledTimes(1)
    })

    it('should call callback and channel.ack with correct params', async () => {
      sut.consumeMessage(fakeSendToQueueInput.queueName, fakeHandler)

      const consumeCallback = mockConsume.mock.calls[0][1]
      await consumeCallback({ content: Buffer.from('any-message') })

      expect(fakeHandler).toHaveBeenCalledWith('any-message')
      expect(mockAck).toHaveBeenCalled()
    })

    it('should throw if channel is not ready', async () => {
      sut['channel'] = undefined

      expect(() => sut.consumeMessage(fakeSendToQueueInput.queueName, () => {})).toThrow()
    })
  })
})

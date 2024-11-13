import { ConsumeQueue } from '@/domain/contracts/queue.contract'
import { SaveOnCache } from '@/domain/contracts/cache.contract'

type AsynchronousCacheSaverWorkerParsedMessage = {
  key: string
  [x: string]: string
}

export class AsynchronousCacheSaverWorker {
  constructor(
    private readonly queueConsumer: ConsumeQueue,
    private readonly queueName: string,
    private readonly cacheSaverHandler: SaveOnCache,
  ) {}

  async consumeFromCacheSaverQueue(): Promise<void> {
    this.queueConsumer.consumeMessage(this.queueName, async (message: string) => {
      console.log('[AsynchronousCacheSaverWorker.consumeFromCacheSaverQueue]: Message received', message)
      const parsedMessage: AsynchronousCacheSaverWorkerParsedMessage = JSON.parse(message)

      await this.cacheSaverHandler.save({
        key: parsedMessage.key,
        value: message,
      })

      console.log('[AsynchronousCacheSaverWorker.consumeFromCacheSaverQueue]: Message saved on cache', message)
    })
  }
}

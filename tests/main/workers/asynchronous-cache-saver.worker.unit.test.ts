import { beforeAll, beforeEach, describe, expect, it, Mocked, vi } from 'vitest'
import { ConsumeQueue } from '@/domain/contracts/queue.contract'
import { AsynchronousCacheSaverWorker } from '@/main/workers/asynchronous-cache-saver.worker'
import { SaveOnCache, SaveOnCacheInput } from '@/domain/contracts/cache.contract'

describe('Asynchronous Cache Saver Worker', () => {
  let sut: AsynchronousCacheSaverWorker
  let fakeQueueConsumer: Mocked<ConsumeQueue>
  let fakeCacheSaver: Mocked<SaveOnCache>
  let fakeInput: SaveOnCacheInput
  let fakeQueueName: string

  beforeAll(() => {
    fakeQueueConsumer = {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      consumeMessage: vi.fn().mockImplementation(async (queueName: string, handler: (message: any) => void) => {
        await handler(JSON.stringify(fakeInput))
      }),
    }
    fakeCacheSaver = {
      save: vi.fn(),
    }
    fakeInput = {
      key: 'any-key',
      value: '{"property": "any-property-value"}',
    }
    fakeQueueName = 'any-queue-name'
  })

  beforeEach(() => {
    vi.clearAllMocks()

    sut = new AsynchronousCacheSaverWorker(fakeQueueConsumer, fakeQueueName, fakeCacheSaver)
  })

  describe('listenFromQueue', () => {
    it('should call cacheSaver.save with correct params', async () => {
      await sut.listenFromQueue()

      expect(fakeCacheSaver.save).toHaveBeenCalledWith({
        key: fakeInput.key,
        value: JSON.stringify(fakeInput),
      })
      expect(fakeCacheSaver.save).toHaveBeenCalledTimes(1)
    })
  })
})

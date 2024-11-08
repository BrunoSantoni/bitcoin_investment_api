import crypto from 'node:crypto'
import { beforeAll, beforeEach, describe, expect, it, Mock, vi } from 'vitest'
import { CryptoCipher } from '@/infra/cryptography/crypto.cipher'
import { CipherCompareInput } from '@/domain/contracts/cipher.contract'

vi.mock('node:crypto')

describe('CryptoCipher', () => {
  let sut: CryptoCipher
  let hexValueOfWordHashedAsBuffer: string
  let hexValueOfWordAnyBufferAsBuffer: string
  let scryptSyncMock: Mock
  let randomBytesMock: Mock

  beforeAll(() => {
    hexValueOfWordHashedAsBuffer = '616e792d627566666572'
    hexValueOfWordAnyBufferAsBuffer = '686173686564'
    scryptSyncMock = vi.mocked(crypto.scryptSync).mockImplementation(() => Buffer.from('hashed'))
    randomBytesMock = vi.mocked(crypto.randomBytes).mockImplementation(() => Buffer.from('any-buffer'))
  })

  beforeEach(() => {
    vi.clearAllMocks()

    sut = new CryptoCipher()
  })

  it('should rethrow when crypto.randomBytes throws', () => {
    randomBytesMock.mockImplementationOnce(() => {
      throw new Error('any error')
    })

    expect(() => new CryptoCipher()).toThrow()
  })

  it('should call crypto.randomBytes with size equals 16', () => {
    const RANDOM_BYTES_SIZE = 16

    expect(randomBytesMock).toHaveBeenCalledWith(RANDOM_BYTES_SIZE)
    expect(randomBytesMock).toHaveBeenCalledTimes(1)
  })

  describe('hash', () => {
    let fakeInput: string

    beforeAll(() => {
      fakeInput = 'any-text'
    })

    it('should rethrow when crypto.scryptSync throws', () => {
      scryptSyncMock.mockImplementationOnce(() => {
        throw new Error('any error')
      })

      expect(() => sut.hash(fakeInput)).toThrow()
    })

    it('should call crypto.scryptSync with received text to hash', () => {
      sut.hash(fakeInput)

      expect(scryptSyncMock).toHaveBeenCalledWith(fakeInput, hexValueOfWordHashedAsBuffer, 64)
      expect(scryptSyncMock).toHaveBeenCalledTimes(1)
    })

    it('should return the hashed text as salt:hash', () => {
      const output = sut.hash(fakeInput)

      expect(output).toBe(`${hexValueOfWordHashedAsBuffer}:${hexValueOfWordAnyBufferAsBuffer}`)
    })
  })

  describe('verify', () => {
    let fakeInput: CipherCompareInput

    beforeAll(() => {
      fakeInput = {
        plainText: 'hashed',
        hashedText: `${hexValueOfWordHashedAsBuffer}:${hexValueOfWordAnyBufferAsBuffer}`,
      }
    })

    it('should rethrow when crypto.scryptSync throws', () => {
      scryptSyncMock.mockImplementationOnce(() => {
        throw new Error('any error')
      })

      expect(() => sut.verify(fakeInput)).toThrow()
    })

    it('should call crypto.scryptSync with received plain text as hex value and with stored hashed salt', () => {
      sut.verify(fakeInput)

      expect(scryptSyncMock).toHaveBeenCalledWith(fakeInput.plainText, hexValueOfWordHashedAsBuffer, 64)
      expect(scryptSyncMock).toHaveBeenCalledTimes(1)
    })

    it('should return true when the received plain text and the stored hashed text are equal', () => {
      const output = sut.verify(fakeInput)

      expect(output).toBe(true)
    })
  })
})

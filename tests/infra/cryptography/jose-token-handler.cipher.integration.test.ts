import * as jose from 'jose'
import { JoseTokenHandler } from '@/infra/cryptography/jose-token-handler.cipher'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

describe('Jose Token Handler Cipher', () => {
  let sut: JoseTokenHandler
  let secret: string
  let fakeInput: object

  beforeAll(() => {
    secret = 'any-secret'
    fakeInput = {
      property: 'any-string',
      userId: 'any-id',
    }
  })

  beforeEach(() => {
    sut = new JoseTokenHandler({
      secret,
    })
  })

  describe('encrypt', () => {
    it('should set protected header as HS256', async () => {
      const setProtectedHeaderSpy = vi.spyOn(jose.SignJWT.prototype, 'setProtectedHeader')

      await sut.encrypt(fakeInput)

      expect(setProtectedHeaderSpy).toHaveBeenCalledWith({ alg: 'HS256' })
      expect(setProtectedHeaderSpy).toHaveBeenCalledTimes(1)
    })

    it('should set expiration time to 1 hour', async () => {
      const setExpirationTimeSpy = vi.spyOn(jose.SignJWT.prototype, 'setExpirationTime')

      await sut.encrypt(fakeInput)

      expect(setExpirationTimeSpy).toHaveBeenCalledWith('1h')
      expect(setExpirationTimeSpy).toHaveBeenCalledTimes(1)
    })

    it('should call sign with encoded secret', async () => {
      const signSpy = vi.spyOn(jose.SignJWT.prototype, 'sign')

      await sut.encrypt(fakeInput)

      expect(signSpy).toHaveBeenCalledWith(new TextEncoder().encode(secret))
      expect(signSpy).toHaveBeenCalledTimes(1)
    })

    it('should return encrypted string on success', async () => {
      const output = await sut.encrypt(fakeInput)

      expect(output).toBeDefined()
    })

    it('should rethrow when any of the methods throw', async () => {
      vi.spyOn(jose.SignJWT.prototype, 'sign').mockRejectedValueOnce(new Error('any-error'))

      const promise = sut.encrypt(fakeInput)

      expect(promise).rejects.toThrow()
    })
  })

  describe('decrypt', () => {
    it('should return decrypted user id on success', async () => {
      const encrypted = await sut.encrypt(fakeInput)

      const output = await sut.decrypt(encrypted)

      expect(output).toBe('any-id')
    })
  })
})

import { UserSignIn, UserSignInInput, UserSignInOutput } from '@/domain/contracts/user-sign-in.contract'
import { CipherCompare } from '@/domain/contracts/cipher.contract'
import { FindUserAccountByEmail } from '@/domain/contracts/account-actions.contract'
import { TokenGenerator } from '@/domain/contracts/token.contract'

export class UserSignInService implements UserSignIn {
  constructor(
    private readonly findUserAccountByEmailRepository: FindUserAccountByEmail,
    private readonly cipherCompare: CipherCompare,
    private readonly tokenGenerator: TokenGenerator,
  ) {
  }

  async handle(input: UserSignInInput): Promise<UserSignInOutput> {
    const { email, password } = input
    const userAccount = await this.findUserAccountByEmailRepository.findByEmail(email)

    if (userAccount === null) {
      return {
        success: false,
        data: {
          message: 'Invalid credentials',
        },
      }
    }

    const isPasswordValid = this.cipherCompare.verify({
      plainText: password,
      hashedText: userAccount.password,
    })

    if (!isPasswordValid) {
      return {
        success: false,
        data: {
          message: 'Invalid credentials',
        },
      }
    }

    const accessToken = await this.tokenGenerator.encrypt({
      userId: userAccount.id,
    })

    return {
      success: true,
      data: { accessToken },
    }
  }
}

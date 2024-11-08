import { UserSignUp, UserSignUpInput, UserSignUpOutput } from '@/domain/contracts/user-sign-up.contract'
import { Encrypt } from '@/domain/contracts/cipher.contract'
import { CreateAccount, FindUserAccountByEmail } from '@/domain/contracts/account-actions.contract'
import { User } from '@/domain/entities/user.entity'

export class UserSignUpService implements UserSignUp {
  constructor(
    private readonly createAccountRepository: CreateAccount,
    private readonly findUserAccountByEmailRepository: FindUserAccountByEmail,
    private readonly encrypter: Encrypt,
  ) {
  }

  async handle(input: UserSignUpInput): Promise<UserSignUpOutput> {
    const { name, email, password } = input
    const existingUser = await this.findUserAccountByEmailRepository.findByEmail(email)

    if (existingUser !== null) {
      return false
    }

    const hashedPassword = this.encrypter.hash(password)
    const userEntity = new User({
      name,
      email,
      hashedPassword,
    })

    await this.createAccountRepository.create(userEntity)

    return true
  }
}

import { CreateAccount, FindUserAccountByEmail } from '@/domain/contracts/account-actions.contract'
import { SavedUser, User } from '@/domain/entities/user.entity'
import { prismaClient } from '@/infra/repositories/prisma.config'

export class AccountPrismaRepository implements CreateAccount, FindUserAccountByEmail {
  async findByEmail(email: string): Promise<SavedUser | null> {
    const foundUser = await prismaClient.user.findFirst({
      where: {
        email,
      },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
      },
    })

    if (foundUser === null) {
      return null
    }

    return new SavedUser({
      id: foundUser.id,
      name: foundUser.name,
      email: foundUser.email,
      hashedPassword: foundUser.password,
    })
  }

  async create(user: User): Promise<SavedUser> {
    const response = await prismaClient.user.create({
      data: {
        name: user.name,
        email: user.email,
        password: user.password,
      },
      select: {
        id: true,
      },
    })

    return new SavedUser({
      id: response.id,
      name: user.name,
      email: user.email,
      hashedPassword: user.password,
    })
  }
}

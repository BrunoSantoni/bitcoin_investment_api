import {
  CreateAccount,
  FindUserAccountByEmail,
  FindUserAccountById,
  UpdateUserBalance,
  UpdateUserBalanceInput,
} from '@/domain/contracts/account-actions.contract'
import { SavedUser, User } from '@/domain/entities/user.entity'
import { prismaClient } from '@/infra/repositories/prisma.config'

export class AccountPrismaRepository implements CreateAccount, FindUserAccountByEmail, FindUserAccountById, UpdateUserBalance {
  async findById(id: string): Promise<SavedUser | null> {
    const foundUser = await prismaClient.user.findFirst({
      where: {
        id,
      },
      select: {
        name: true,
        email: true,
        password: true,
        balance: true,
      },
    })

    if (foundUser === null) {
      return null
    }

    return new SavedUser({
      id,
      name: foundUser.name,
      email: foundUser.email,
      hashedPassword: foundUser.password,
      balanceInCents: Number(foundUser.balance),
    })
  }

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
        balance: true,
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
      balanceInCents: Number(foundUser.balance),
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
      balanceInCents: 0,
    })
  }

  async updateBalance(input: UpdateUserBalanceInput): Promise<SavedUser | null> {
    const { userId, amountInCents, type } = input

    const user = await prismaClient.user.findFirst({
      where: {
        id: userId,
      },
      select: {
        name: true,
        email: true,
        password: true,
        balance: true,
      },
    })

    if (user === null) {
      return null
    }

    let newBalance: number

    if (type === 'withdraw') {
      newBalance = Number(user.balance) - amountInCents
      if (newBalance < 0) {
        throw new Error('Cannot withdraw the request amount')
      }
    }
    else {
      newBalance = Number(user.balance) + amountInCents
    }

    await prismaClient.user.update({
      where: {
        id: userId,
      },
      data: {
        balance: newBalance,
      },
      select: {
        name: true,
        email: true,
        password: true,
      },
    })

    return new SavedUser({
      id: userId,
      name: user.name,
      email: user.email,
      hashedPassword: user.password,
      balanceInCents: newBalance,
    })
  }
}

import { SavedUser, User } from '@/domain/entities/user.entity'

export interface CreateAccount {
  create(user: User): Promise<SavedUser>
}

export interface FindUserAccountByEmail {
  findByEmail(email: string): Promise<SavedUser | null>
}

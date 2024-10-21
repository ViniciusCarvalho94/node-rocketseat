import { PrismaUsersRepository } from '@/repositories/prisma/prisma-users-repository'
import { AuthenticateUseCase } from '../authenticate'

export function makeAutenticateUseCase() {
  const usersRepository = new PrismaUsersRepository()
  const autenticateUseCase = new AuthenticateUseCase(usersRepository)

  return autenticateUseCase
}

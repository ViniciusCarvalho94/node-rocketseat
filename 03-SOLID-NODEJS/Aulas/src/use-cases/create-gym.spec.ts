import { InMemoryGymsRepository } from '@/repositories/in-memory/in-memory-gyms-repository'
import { it, describe, expect, beforeEach } from 'vitest'
import { CreateGymUseCase } from './create-gym'

let usersRepository: InMemoryGymsRepository
let sut: CreateGymUseCase

describe('Register Use Case', () => {
  beforeEach(async () => {
    usersRepository = new InMemoryGymsRepository()
    sut = new CreateGymUseCase(usersRepository)
  })

  it('should be able to register', async () => {
    const { gym } = await sut.execute({
      title: 'JavaScript Gym',
      description: null,
      phone: null,
      latitude: -23.5391406,
      longitude: -46.5258909,
    })

    expect(gym.id).toEqual(expect.any(String))
  })
})

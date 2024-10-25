import { FastifyInstance } from 'fastify'
import resquest from 'supertest'

export async function createAndAuthenticateUser(app: FastifyInstance) {
  await resquest(app.server).post('/users').send({
    name: 'John Doe',
    email: 'johndoe@example.com',
    password: '123456',
  })

  const authReponse = await resquest(app.server).post('/sessions').send({
    email: 'johndoe@example.com',
    password: '123456',
  })

  const { token } = authReponse.body

  return {
    token,
  }
}

import { FastifyInstance } from 'fastify'
import { register } from '../users/register'
import { authenticate } from '../users/authenticate'
import { profile } from '../users/profile'
import { verifyJWT } from '../../middlewares/verify-jwt'
import { refresh } from './refresh'

export async function usersRoutes(app: FastifyInstance) {
  app.post('/users', register)
  app.post('/sessions', authenticate)

  app.patch('/token/refresh', refresh)

  /** Authenticated **/
  app.get('/me', { onRequest: [verifyJWT] }, profile)
}

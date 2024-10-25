import { FastifyInstance } from 'fastify'
import { register } from '../users/register'
import { authenticate } from '../users/authenticate'
import { profile } from '../users/profile'
import { verifyJWT } from '../../middlewares/verify-jwt'

export async function usersRoutes(app: FastifyInstance) {
  app.post('/users', register)
  app.post('/sessions', authenticate)

  /** Authenticated **/
  app.get('/me', { onRequest: [verifyJWT] }, profile)
}

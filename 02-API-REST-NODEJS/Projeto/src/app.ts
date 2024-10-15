import fastify from 'fastify'
import cookie from '@fastify/cookie'

import { userRoutes } from './routes/user'
import { dailyDietRoutes } from './routes/daily-diet'

export const app = fastify()

app.register(cookie)

app.register(userRoutes, { prefix: 'user' })
app.register(dailyDietRoutes, { prefix: 'daily-diet' })

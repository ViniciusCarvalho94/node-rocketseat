import { app } from './app'
import { env } from './env'

app.listen({ port: Number(env.PORT) }).then(() => {
  console.log('Server listening on port 3333')
})

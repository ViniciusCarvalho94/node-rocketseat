import { it, describe, beforeEach, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import { execSync } from 'node:child_process'

import { app } from '../src/app'

describe.sequential('User routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
  })

  it('should be able to create a new user', async () => {
    await request(app.server)
      .post('/user/create')
      .send({ name: 'John Doe' })
      .expect(201)
  })
})

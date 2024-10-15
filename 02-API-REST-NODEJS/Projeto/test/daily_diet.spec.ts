import { it, describe, beforeEach, beforeAll, afterAll, expect } from 'vitest'
import { execSync } from 'child_process'
import request from 'supertest'
import { app } from '../src/app'

describe.sequential('Daily diet routes', () => {
  let cookie: string[]
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(async () => {
    execSync('npm run knex migrate:rollback')
    execSync('npm run knex migrate:latest')
    const user = await request(app.server)
      .post('/user/create')
      .send({ name: 'John Doe' })
      .expect(201)

    cookie = user.get('Set-Cookie') ?? []
  })

  it('should be able to create a new daily diet', async () => {
    await request(app.server)
      .post('/daily-diet/create')
      .set('Cookie', cookie)
      .send({
        name: 'Café da manhã',
        description: 'Café e bolachas água e sal',
        diet: true,
      })
      .expect(201)
  })

  it('should be able to list all daily diet from a user', async () => {
    await request(app.server)
      .post('/daily-diet/create')
      .set('Cookie', cookie)
      .send({
        name: 'Café da manhã',
        description: 'Café e bolachas água e sal',
        diet: true,
      })
      .expect(201)

    await request(app.server)
      .post('/daily-diet/create')
      .set('Cookie', cookie)
      .send({
        name: 'Pizza',
        description: 'Portuguesa',
        diet: false,
      })
      .expect(201)

    const list = await request(app.server)
      .get('/daily-diet/list')
      .set('Cookie', cookie)
      .expect(200)

    expect(list.body).toHaveLength(2)

    expect(list.body[0].name).toBe('Café da manhã')
    expect(list.body[1].name).toBe('Pizza')
  })

  it('should be able to show a single daily diet', async () => {
    await request(app.server)
      .post('/daily-diet/create')
      .set('Cookie', cookie)
      .send({
        name: 'Café da manhã',
        description: 'Café e bolachas água e sal',
        diet: true,
      })
      .expect(201)

    const list = await request(app.server)
      .get('/daily-diet/list')
      .set('Cookie', cookie)
      .expect(200)

    const dailyDietId = list.body[0].id

    const dailyDiet = await request(app.server)
      .get(`/daily-diet/list/${dailyDietId}`)
      .set('Cookie', cookie)
      .expect(200)

    expect(dailyDiet.body).toEqual(
      expect.objectContaining({
        name: 'Café da manhã',
        description: 'Café e bolachas água e sal',
        diet: 1,
      }),
    )
  })

  it('should be able to update a daily diet from a user', async () => {
    await request(app.server)
      .post('/daily-diet/create')
      .set('Cookie', cookie)
      .send({
        name: 'Café da manhã',
        description: 'Café e bolachas água e sal',
        diet: true,
      })
      .expect(201)

    const list = await request(app.server)
      .get('/daily-diet/list')
      .set('Cookie', cookie)
      .expect(200)

    const dailyDietId = list.body[0].id

    await request(app.server)
      .post(`/daily-diet/edit/${dailyDietId}`)
      .set('Cookie', cookie)
      .send({
        name: 'Café da tarde',
        description: 'Café',
        diet: true,
      })
      .expect(200)
  })

  it('should be able to delete a daily-diet from a user', async () => {
    await request(app.server)
      .post('/daily-diet/create')
      .set('Cookie', cookie)
      .send({
        name: 'Café da manhã',
        description: 'Café e bolachas água e sal',
        diet: true,
      })
      .expect(201)

    const list = await request(app.server)
      .get('/daily-diet/list')
      .set('Cookie', cookie)
      .expect(200)

    const dailyDietId = list.body[0].id

    await request(app.server)
      .delete(`/daily-diet/remove/${dailyDietId}`)
      .set('Cookie', cookie)
      .expect(200)
  })

  it('should be able to get summary from a user', async () => {
    await request(app.server)
      .post('/daily-diet/create')
      .set('Cookie', cookie)
      .send({
        name: 'Café da manhã',
        description: 'Café e bolachas água e sal',
        diet: true,
      })
      .expect(201)

    await request(app.server)
      .post('/daily-diet/create')
      .set('Cookie', cookie)
      .send({
        name: 'Pizza',
        description: 'Portuguesa',
        diet: false,
      })
      .expect(201)

    await request(app.server)
      .post('/daily-diet/create')
      .set('Cookie', cookie)
      .send({
        name: 'Hamburger',
        description: 'Double meat',
        diet: false,
      })
      .expect(201)

    await request(app.server)
      .post('/daily-diet/create')
      .set('Cookie', cookie)
      .send({
        name: 'Almoço',
        description: 'Arroz, Feijão, Salada e Bife acebolado',
        diet: true,
      })

    await request(app.server)
      .post('/daily-diet/create')
      .set('Cookie', cookie)
      .send({
        name: 'Janta',
        description: 'Arroz, Feijão, Salada e Filé de frango grelhado',
        diet: true,
      })

    const summary = await request(app.server)
      .get('/daily-diet/summary')
      .set('Cookie', cookie)
      .expect(200)

    expect(summary.body).toEqual({
      total: 5,
      numberOfDiet: 3,
      numberOfNotDiet: 2,
      dietSequence: 2,
    })
  })
})

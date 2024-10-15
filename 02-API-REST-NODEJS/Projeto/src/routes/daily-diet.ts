import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'
import { knex } from '../database'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'

export async function dailyDietRoutes(app: FastifyInstance) {
  app.post(
    '/create',
    { preHandler: [checkSessionIdExists] },
    async (request, reply) => {
      const createDailyDietBodySchema = z.object({
        name: z.string(),
        description: z.string(),
        diet: z.boolean(),
      })

      const { name, description, diet } = createDailyDietBodySchema.parse(
        request.body,
      )

      const { sessionId } = request.cookies

      const user = await knex('user').where({ session_id: sessionId }).first()

      await knex('daily_diet').insert({
        id: randomUUID(),
        name,
        description,
        diet,
        user_id: user.id,
      })

      return reply.status(201).send()
    },
  )

  app.post(
    '/edit/:id',
    { preHandler: [checkSessionIdExists] },
    async (request, reply) => {
      const editDailyDietParamsSchema = z.object({
        id: z.string(),
      })

      const editDailyDietBodySchema = z.object({
        name: z.string(),
        description: z.string(),
        diet: z.boolean(),
      })

      const { id } = editDailyDietParamsSchema.parse(request.params)
      const { name, description, diet } = editDailyDietBodySchema.parse(
        request.body,
      )

      const { sessionId } = request.cookies

      const user = await knex('user').where({ session_id: sessionId }).first()

      await knex('daily_diet')
        .update({
          name,
          description,
          diet,
        })
        .where({
          id,
          user_id: user.id,
        })

      return reply.status(200).send()
    },
  )

  app.delete(
    '/remove/:id',
    { preHandler: [checkSessionIdExists] },
    async (request, reply) => {
      const deleteDailyDietParamsSchema = z.object({
        id: z.string(),
      })

      const { id } = deleteDailyDietParamsSchema.parse(request.params)

      const { sessionId } = request.cookies

      const user = await knex('user').where({ session_id: sessionId }).first()

      await knex('daily_diet').delete().where({ id, user_id: user.id })

      return reply.status(200).send()
    },
  )

  app.get(
    '/list',
    { preHandler: [checkSessionIdExists] },
    async (request, reply) => {
      const { sessionId } = request.cookies

      const user = await knex('user').where({ session_id: sessionId }).first()

      const dailyDiet = await knex('daily_diet').where({ user_id: user.id })

      return reply.status(200).send(dailyDiet)
    },
  )

  app.get(
    '/list/:id',
    { preHandler: [checkSessionIdExists] },
    async (request, reply) => {
      const getDailyDietParamsSchema = z.object({
        id: z.string(),
      })

      const { id } = getDailyDietParamsSchema.parse(request.params)

      const { sessionId } = request.cookies

      const user = await knex('user').where({ session_id: sessionId }).first()

      const dailyDiet = await knex('daily_diet')
        .where({ id, user_id: user.id })
        .first()

      if (!dailyDiet) {
        return reply.status(404).send({ error: 'Daily diet not found' })
      }

      return reply.status(200).send(dailyDiet)
    },
  )

  app.get(
    '/summary',
    { preHandler: [checkSessionIdExists] },
    async (request, reply) => {
      const { sessionId } = request.cookies

      const user = await knex('user').where({ session_id: sessionId }).first()

      const summary = await knex('daily_diet')
        .count('id', { as: 'total' })
        .select(
          knex.raw(
            'sum(case when daily_diet.diet = true then 1 else 0 end) as "numberOfDiet"',
          ),
          knex.raw(
            'sum(case when daily_diet.diet = false then 1 else 0 end) as numberOfNotDiet',
          ),
        )
        .where({ user_id: user.id })
        .first()

      if (!summary) {
        return reply.status(404).send({ error: 'Summary not found' })
      }

      const totalDailyDiet = await knex('daily_diet')
        .where({ user_id: user.id })
        .orderBy('created_at', 'desc')

      const { dietSequence } = totalDailyDiet.reduce(
        (acc, curr) => {
          if (!curr.diet) {
            acc.sequence = 0
          } else {
            acc.sequence += 1
          }

          if (acc.sequence > acc.dietSequence) {
            acc.dietSequence = acc.sequence
          }

          return acc
        },
        { dietSequence: 0, sequence: 0 },
      )

      return reply.status(200).send({ ...summary, dietSequence })
    },
  )
}

import { randomUUID } from 'node:crypto'
import { parse } from 'csv-parse'
import fs from 'node:fs'

import Database from '../database/db.js'
import buildRoutePath from '../utils/build-route-path.js'


const database = new Database()
const csvFile = new URL('../storage/tasks.csv', import.meta.url)

export const routes = [
  {
    method: 'GET',
    path: buildRoutePath('/tasks'),
    handler: (_req, res) => {
      return res.end(JSON.stringify(database.select('tasks')))
    }
  },
  {
    method: 'POST',
    path: buildRoutePath('/tasks'),
    handler: (req, res) => {
      const { title, description } = req.body

      if (!title || !description) {
        return res.writeHead(400).end({ message: 'Title and description are required!' })
      }

      const task = {
        id: randomUUID(),
        title,
        description,
        completed_at: null,
        created_at: new Date(),
        updated_at: null
      }

      database.insert('tasks', task)

      return res.writeHead(201).end()
    }
  },
  {
    method: 'POST',
    path: buildRoutePath('/tasks/csv'),
    handler: (req, res) => {
      const stream = fs.createReadStream(csvFile)

      const parseCsv = parse({
        delimiter: ',',
        skipEmptyLines: true,
        fromLine: 2,
      })

      stream.pipe(parseCsv)

      parseCsv.on(('data'), async (line) => {
        const [title, description] = line
        const task = {
          id: randomUUID(),
          title,
          description,
          completed_at: null,
          created_at: new Date(),
          updated_at: null
        }

        database.insert('tasks', task)
      })

      return res.writeHead(201).end()
    }
  },
  {
    method: 'PUT',
    path: buildRoutePath('/tasks/:id'),
    handler: (req, res) => {
      const { id } = req.params
      const { description } = req.body

      if (!description) {
        return res.writeHead(400).end(JSON.stringify({ message: 'Description are required!' }))
      }

      database.update('tasks', id, { description })

      return res.writeHead(204).end()
    }
  },
  {
    method: 'DELETE',
    path: buildRoutePath('/tasks/:id'),
    handler: (req, res) => {
      const { id } = req.params

      database.delete('tasks', id)

      return res.writeHead(204).end()
    }
  },
  {
    method: 'PATCH',
    path: buildRoutePath('/tasks/:id/complete'),
    handler: (req, res) => {
      const { id } = req.params

      database.patch('tasks', id, { completed_at: new Date() })

      return res.writeHead(204).end()
    }
  },
]
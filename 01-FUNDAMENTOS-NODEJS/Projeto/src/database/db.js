import fs from 'node:fs/promises'

const databasePath = new URL('db.json', import.meta.url)

export default class Database {
  #database = {}

  constructor() {
    fs.readFile(databasePath, 'utf8')
      .then((data) => {
        this.#database = JSON.parse(data)
      })
      .catch(() => {
        this.#persist()
      })
  }

  #persist() {
    fs.writeFile(databasePath, JSON.stringify(this.#database))
  }

  select(table) {
    let data = this.#database[table] ?? []

    return data
  }

  insert(table, data) {
    if (Array.isArray(this.#database[table])) {
      this.#database[table].push(data)
    } else {
      this.#database[table] = [data]
    }
    this.#persist()

    return data
  }

  update(table, id, data) {
    const { description } = data

    const rowIndex = this.#database[table].findIndex((row) => row.id === id)

    if (rowIndex > -1) {
      const oldValue = this.#database[table][rowIndex]
      this.#database[table][rowIndex] = {
        ...oldValue,
        id,
        description,
        updated_at: new Date(),
       }
      this.#persist()
    }
  }

  delete(table, id) {
    const rowIndex = this.#database[table].findIndex((row) => row.id === id)

    if (rowIndex > -1) {
      this.#database[table].splice(rowIndex, 1)
      this.#persist()
    }
  }

  patch(table, id, data) {
    const { completed_at } = data

    const rowIndex = this.#database[table].findIndex((row) => row.id === id)

    if (rowIndex > -1) {
      const oldValue = this.#database[table][rowIndex]
      this.#database[table][rowIndex] = {
        ...oldValue,
        id,
        completed_at,
        updated_at: new Date(),
       }
      this.#persist()
    }
  }
}
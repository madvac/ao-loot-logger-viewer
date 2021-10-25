import axios from 'axios'

class Database {
  constructor(key = '', collectionId = '') {
    this.valid = !!(key && collectionId)

    this.axios = axios.create({
      baseURL: 'https://api.jsonbin.io/v3',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': atob(key),
        'X-Collection-Id': collectionId,
        'X-Bin-Private': true
      }
    })
  }

  async create(data) {
    if (process.env.NODE_ENV !== 'production' && !process.env.VUE_APP_ENABLE_WRITE_BIN) {
      console.log(`write bin is not enabled. env=${process.env.NODE_ENV} VUE_APP_ENABLE_WRITE_BIN=${process.env.VUE_APP_ENABLE_WRITE_BIN}`)

      return '60ca8b6f8ea8ec25bd0e8c50'
    }

    const response = await this.axios.post('/b', data)

    return response.data.metadata.id
  }

  async read(id) {
    if (process.env.NODE_ENV !== 'production' && !process.env.VUE_APP_ENABLE_READ_BIN) {
      console.log(`read bin is not enabled. env=${process.env.NODE_ENV} VUE_APP_ENABLE_READ_BIN=${process.env.VUE_APP_ENABLE_READ_BIN}`)

      return {
        record: {
          lootLogs: [],
          chestLogs: [],
          showPlayers: {},
          hidePlayers: {}
        }
      }
    }

    const response = await this.axios.get(`/b/${id}/latest`)

    return response.data
  }
}

const db = new Database(process.env.VUE_APP_BIN_KEY, process.env.VUE_APP_COLLECTION_ID)

export default db

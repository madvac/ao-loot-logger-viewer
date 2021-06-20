import axios from 'axios'

class Database {
  constructor(key = '', collectionId = '') {
    this.valid = key && collectionId

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
    // if (process.env.NODE_ENV !== 'production') {
    //   return '60ca8b6f8ea8ec25bd0e8c50'
    // }

    const response = await this.axios.post('/b', data)

    return response.data.metadata.id
  }

  async read(id) {
    // if (process.env.NODE_ENV !== 'production') {
    //   return {
    //     record: {
    //       lootLogs: {},
    //       chestLogs: {},
    //       selectedPlayersLogs: {}
    //     }
    //   }
    // }

    await new Promise(resolve => setTimeout(resolve, 10000))

    const response = await this.axios.get(`/b/${id}/latest`)

    return response.data
  }
}

export default Database

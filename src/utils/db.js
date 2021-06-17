import axios from 'axios'

class Database {
  constructor() {
    this.axios = axios.create({
      baseURL: 'https://api.jsonbin.io/v3',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': atob(process.env.VUE_APP_BIN_KEY),
        'X-Collection-Id': process.env.VUE_APP_COLLECTION_ID,
        'X-Bin-Private': true
      }
    })
  }

  async create(data) {
    const response = await this.axios.post('/b', data)

    return response.data.metadata.id
  }

  async read(id) {
    const response = await this.axios.get(`/b/${id}/latest`)

    return response.data
  }
}

export default new Database()

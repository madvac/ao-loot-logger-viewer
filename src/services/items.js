import axios from 'axios'

class Items {
  constructor() {
    this.items = {}

    // this.idToName = {}
    // this.locNameVarToName = {}
    // this.indexToName = {}
    // this.nameToInfo = {}

    this.isInitialized = false
  }

  getNameFromId(itemId) {
    return this.items[itemId]?.name || this.items[`@ITEMS_${itemId}`]?.name
  }

  getNameFromIndex(itemIndex) {
    return this.items[itemIndex].name
  }

  getIdFromName(itemName) {
    return this.items[itemName].id
  }

  getInfoFromName(itemName) {
    return this.items[itemName]
  }

  getInfoFromId(itemId) {
    return this.items[itemId]
  }

  getInfoFromIndex(itemIndex) {
    return this.items[itemIndex]
  }

  async init(sha = null) {
    if (sha === this.sha && this.isInitialized) {
      return
    }

    console.time('items.init')

    this.isInitialized = true

    let response = null

    if (sha) {
      this.sha = sha
    } else {
      response = await axios.get('https://api.github.com/repos/broderickhyman/ao-bin-dumps/commits/master')

      this.sha = response.data.sha
    }

    response = await axios.get(
      `https://raw.githubusercontent.com/broderickhyman/ao-bin-dumps/${this.sha}/formatted/items.json`
    )

    for (const item of response.data) {
      const locName = item.LocalizedNames && item.LocalizedNames['EN-US'] ? item.LocalizedNames['EN-US'] : null
      const name = locName || item.UniqueName

      const data = {
        name,
        locName,
        locNameVar: item.LocalizationNameVariable,
        id: item.UniqueName,
        index: item.Index
      }

      this.items[item.UniqueName] = data
      this.items[item.LocalizationNameVariable] = data
      this.items[item.Index] = data

      if (this.items[name] == null || item.UniqueName.indexOf('@') === -1) {
        this.items[name] = data
      }

      // this.idToName[item.UniqueName] = name
      // this.locNameVarToName[item.LocalizationNameVariable] = name
      // this.indexToName[item.Index] = name

      // if (this.nameToInfo[name] == null || item.UniqueName.indexOf('@') === -1) {
      //   this.nameToInfo[name] = {
      //     name,
      //     id: item.UniqueName,
      //     index: item.Index
      //   }
      // }
    }

    response = await axios.get(`https://raw.githubusercontent.com/broderickhyman/ao-bin-dumps/${this.sha}/items.json`)

    for (const item of response.data.items.mountskin) {
      const id = item['@uniquename']
      const name = this.getNameFromId(id)

      this.items[name].category = 'skin'
      this.items[name].subcategory = 'mountskin'
    }

    const ignoreGroups = {
      '@xmlns:xsi': true,
      '@xsi:noNamespaceSchemaLocation': true,
      shopcategories: true,
      mountskin: true
    }

    for (const groupName in response.data.items) {
      if (ignoreGroups[groupName]) {
        continue
      }

      const group = response.data.items[groupName]

      if (group.length == null) {
        continue
      }

      for (const item of group) {
        for (let i = 0; i <= 3; i++) {
          const id = i ? `${item['@uniquename']}@${i}` : item['@uniquename']

          if (this.items[id] == null) {
            continue
          }

          this.items[id].tier = parseInt(item['@tier'], 10)
          this.items[id].category = item['@shopcategory']
          this.items[id].subcategory = item['@shopsubcategory1']

          if (item['@slottype']) {
            this.items[id].slotType = item['@slottype']
          }

          if (this.items[id].tier == null) {
            console.warn('Item without Tier', groupName, item)
          }

          if (this.items[id].category == null) {
            console.warn('Item without Category', groupName, item)
          }

          if (this.items[id].subcategory == null) {
            console.warn('Item without SubCategory', groupName, item)
          }

          if (this.items[id].category === 'products' && this.items[id].subcategory === 'journal') {
            const journalFull = this.getNameFromId(`${id}_FULL`)

            this.items[journalFull].tier = parseInt(item['@tier'], 10)
            this.items[journalFull].category = item['@shopcategory']
            this.items[journalFull].subcategory = item['@shopsubcategory1']

            const journalEmpty = this.getNameFromId(`${id}_EMPTY`)

            this.items[journalEmpty].tier = parseInt(item['@tier'], 10)
            this.items[journalEmpty].category = item['@shopcategory']
            this.items[journalEmpty].subcategory = item['@shopsubcategory1']
          }
        }
      }
    }

    console.timeEnd('items.init')
  }
}

export default new Items()

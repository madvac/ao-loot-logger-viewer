import axios from 'axios'

class Items {
  constructor() {
    this.idToName = {}
    this.locNameVarToName = {}
    this.indexToName = {}
    this.nameToInfo = {}

    this.isInitialized = false
  }

  getNameFromId(itemId) {
    return this.idToName[itemId] || this.locNameVarToName[`@ITEMS_${itemId}`]
  }

  getNameFromIndex(itemIndex) {
    return this.indexToName[itemIndex]
  }

  getIdFromName(itemName) {
    return this.nameToInfo[itemName].id
  }

  getInfoFromName(itemName) {
    return this.nameToInfo[itemName]
  }

  getInfoFromId(itemId) {
    return this.getInfoFromName(this.getNameFromId(itemId))
  }

  getInfoFromIndex(itemIndex) {
    return this.getInfoFromName(this.getNameFromIndex(itemIndex))
  }

  async init() {
    if (this.isInitialized) {
      return
    }

    this.isInitialized = true

    let response = await axios.get(
      'https://raw.githubusercontent.com/broderickhyman/ao-bin-dumps/master/formatted/items.json'
    )

    for (const item of response.data) {
      const name = item.LocalizedNames && item.LocalizedNames['EN-US'] ? item.LocalizedNames['EN-US'] : item.UniqueName

      this.idToName[item.UniqueName] = name
      this.locNameVarToName[item.LocalizationNameVariable] = name
      this.indexToName[item.Index] = name

      if (this.nameToInfo[name] == null || item.UniqueName.indexOf('@') === -1) {
        this.nameToInfo[name] = {
          name,
          id: item.UniqueName,
          index: item.Index
        }
      }
    }

    response = await axios.get('https://raw.githubusercontent.com/broderickhyman/ao-bin-dumps/master/items.json')

    for (const item of response.data.items.mountskin) {
      const id = item['@uniquename']
      const name = this.getNameFromId(id)

      this.nameToInfo[name].category = 'skin'
      this.nameToInfo[name].subcategory = 'mountskin'
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
        const id = item['@uniquename']
        const name = this.getNameFromId(id)

        if (this.nameToInfo[name] == null) {
          console.error('Invalid item name', groupName, item)

          continue
        }

        this.nameToInfo[name].tier = parseInt(item['@tier'], 10)
        this.nameToInfo[name].category = item['@shopcategory']
        this.nameToInfo[name].subcategory = item['@shopsubcategory1']

        if (item['@slottype']) {
          this.nameToInfo[name].slotType = item['@slottype']
        }

        if (this.nameToInfo[name].tier == null) {
          console.warn('Item without Tier', groupName, item)
        }

        if (this.nameToInfo[name].category == null) {
          console.warn('Item without Category', groupName, item)
        }

        if (this.nameToInfo[name].subcategory == null) {
          console.warn('Item without SubCategory', groupName, item)
        }

        if (this.nameToInfo[name].category === 'products' && this.nameToInfo[name].subcategory === 'journal') {
          const journalFull = this.getNameFromId(`${id}_FULL`)

          this.nameToInfo[journalFull].tier = parseInt(item['@tier'], 10)
          this.nameToInfo[journalFull].category = item['@shopcategory']
          this.nameToInfo[journalFull].subcategory = item['@shopsubcategory1']

          const journalEmpty = this.getNameFromId(`${id}_EMPTY`)

          this.nameToInfo[journalEmpty].tier = parseInt(item['@tier'], 10)
          this.nameToInfo[journalEmpty].category = item['@shopcategory']
          this.nameToInfo[journalEmpty].subcategory = item['@shopsubcategory1']
        }
      }
    }
  }
}

export default new Items()

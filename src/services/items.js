import axios from 'axios'

class Items {
  constructor() {
    this.items = {}

    this.isInitialized = false
  }

  getLocalizedNamesFromId(itemId) {
    return this.items[itemId]?.localizedNames || this.items[`@ITEMS_${itemId}`]?.localizedNames
  }

  getNameFromId(itemId) {
    return this.items[itemId]?.localizedNames['EN-US'] || this.items[`@ITEMS_${itemId}`]?.localizedNames['EN-US']
  }

  getLocalizedNamesFromIndex(itemIndex) {
    return this.items[itemIndex].localizedNames
  }

  getNameFromIndex(itemIndex) {
    return this.items[itemIndex].localizedNames['EN-US']
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

  async loadSHA() {
    console.info('loading latest SHA from ao-bin-dumps')

    const response = await axios.get('https://api.github.com/repos/broderickhyman/ao-bin-dumps/commits/master')

    console.log('latest SHA from ao-bin-dumps', response.data.sha)

    this.sha = response.data.sha
  }

  async init(sha = 'master') {
    if (sha === this.sha && this.isInitialized) {
      return
    }

    console.info(`loading items from ao-bin-dumps. SHA=${sha}`)

    this.isInitialized = true
    this.sha = sha

    let response = await axios.get(
      `https://raw.githubusercontent.com/broderickhyman/ao-bin-dumps/${this.sha}/formatted/items.json`
    )

    for (const item of response.data) {
      const data = {
        localizedNames: item.LocalizedNames,
        locNameVar: item.LocalizationNameVariable,
        id: item.UniqueName,
        index: item.Index
      }

      this.items[item.UniqueName] = data
      this.items[item.LocalizationNameVariable] = data
      this.items[item.Index] = data

      if (item.LocalizedNames) {
        for (const lang in item.LocalizedNames) {
          const locName = item.LocalizedNames[lang]
          const name = locName || item.UniqueName

          if (this.items[name] == null || item.UniqueName.indexOf('@') === -1) {
            this.items[name] = data
          }
        }
      }
    }

    response = await axios.get(`https://raw.githubusercontent.com/broderickhyman/ao-bin-dumps/${this.sha}/items.json`)

    for (const item of response.data.items.mountskin) {
      const id = item['@uniquename']
      const locNames = this.getLocalizedNamesFromId(id)

      for (const lang in locNames) {
        const name = locNames[lang]

        this.items[name].category = 'skin'
        this.items[name].subcategory = 'mountskin'
      }
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
            const locNamesJournalFull = this.getLocalizedNamesFromId(`${id}_FULL`)

            for (const lang in locNamesJournalFull) {
              const journalFull = locNamesJournalFull[lang]

              this.items[journalFull].tier = parseInt(item['@tier'], 10)
              this.items[journalFull].category = item['@shopcategory']
              this.items[journalFull].subcategory = item['@shopsubcategory1']
            }

            const locNamesJournalEmpty = this.getLocalizedNamesFromId(`${id}_EMPTY`)

            for (const lang in locNamesJournalEmpty) {
              const journalEmpty = locNamesJournalEmpty[lang]

              this.items[journalEmpty].tier = parseInt(item['@tier'], 10)
              this.items[journalEmpty].category = item['@shopcategory']
              this.items[journalEmpty].subcategory = item['@shopsubcategory1']
            }
          }
        }
      }
    }
  }
}

export default new Items()

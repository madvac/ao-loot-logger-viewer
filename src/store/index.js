import Vue from 'vue'
import Vuex from 'vuex'
import VuexPersistence from 'vuex-persist'
import iziToast from 'izitoast'
import jschardet from 'jschardet'

import deepFreeze from '../utils/deepFreeze'
import Items from '../services/items'
import { strToDate } from '../utils/date'
import shouldFilterItem from '../services/should-filter-item'
import regex from '../utils/regex'
import router from '../router'
import database from '../services/database'
import { copyToClipboard, compressData } from '../utils'

Vue.use(Vuex)

const FILTERS = {
  t4: true,
  t5: true,
  t6: true,
  t7: true,
  t8: true,
  bag: false,
  cape: false,
  lost: true,
  donated: false,
  food: false,
  mount: false,
  others: false,
  resolved: true,
  potion: false,
  trash: false
}

const vuexLocal = new VuexPersistence({
  key: 'ao-loot-logger-viewer',
  storage: window.localStorage,
  reducer: state => {
    const filters = { ...FILTERS }

    for (const filter in FILTERS) {
      filters[filter] = !!state.filters[filter]
    }

    return { filters }
  },
  restoreState: (key, storage) => {
    let storedState

    try {
      storedState = JSON.parse(storage[key])
    } catch {
      return null
    }

    const filters = { ...FILTERS }

    for (const filter in FILTERS) {
      filters[filter] = !!storedState.filters[filter]
    }

    return { filters }
  },
  filter: mutation => (mutation.type = 'toggleFilter')
})

export default new Vuex.Store({
  strict: true,
  plugins: [vuexLocal.plugin],
  state: {
    blockSharing: false,
    blockUpload: false,
    exporting: false,
    initialized: false,
    loadingBin: false,
    loadingItems: false,
    sharing: false,
    files: {},
    hidePlayers: {},
    showPlayers: {},
    chestLogs: [],
    lootLogs: [],
    filters: {
      ...FILTERS
    }
  },
  mutations: {
    RESTORE_MUTATION: vuexLocal.RESTORE_MUTATION,
    reset(state) {
      state.blockSharing = false
      state.blockUpload = false
      state.exporting = false
      state.loadingBin = false
      state.loadingItems = false
      state.sharing = false
      state.files = {}
      state.hidePlayers = {}
      state.showPlayers = {}
      state.chestLogs = []
      state.lootLogs = []
    },
    setInitialized(state, value) {
      state.initialized = value
    },
    setLoadingBin(state, value) {
      state.loadingBin = value
    },
    setLoadingItems(state, value) {
      state.loadingItems = value
    },
    setBlockUpload(state, value) {
      state.blockUpload = value
    },
    setBlockSharing(state, value) {
      state.blockSharing = value
    },
    setSharing(state, value) {
      state.sharing = value
    },
    setExporting(state, value) {
      state.exporting = value
    },
    uploadedFiles(state, uploadedFiles) {
      const files = {
        ...state.files
      }

      const showPlayers = {
        ...state.showPlayers
      }

      for (const file of uploadedFiles.filter(e => e.type === 'show-players')) {
        const { filename } = file

        if (files[filename]) {
          for (let key in showPlayers) {
            if (showPlayers[key] === filename) {
              delete showPlayers[key]
            }
          }
        }

        files[filename] = true

        for (const match of file.matches) {
          const playerName = (match.groups.userName1 || match.groups.userName2 || match.groups.userName3).toLowerCase()

          showPlayers[playerName] = filename
        }
      }

      let lootLogs = [...state.lootLogs]

      for (const file of uploadedFiles.filter(e => e.type === 'loot-logs')) {
        const { filename } = file

        if (files[filename]) {
          lootLogs = lootLogs.filter(log => log.filename != filename)
        }

        files[filename] = true

        for (const match of file.matches) {
          const lootedAt = strToDate(match.groups.lootedAt)
          const lootedByAlliance = match.groups.lootedByAlliance
          const lootedByGuild = match.groups.lootedByGuild
          const lootedBy = match.groups.lootedBy
          const amount = parseInt(match.groups.amount, 10)
          const lootedFromAlliance = match.groups.lootedFromAlliance
          const lootedFromGuild = match.groups.lootedFromGuild
          const lootedFrom = match.groups.lootedFrom

          const info = Items.getInfoFromId(match.groups.itemId)

          const itemId = info.id
          const itemName = info.localizedNames && info.localizedNames['EN-US'] ? info.localizedNames['EN-US'] : info.id
          const tier = info.tier
          const category = info.category
          const subcategory = info.subcategory

          const log = {
            filename,
            lootedAt,
            lootedByAlliance,
            lootedByGuild,
            lootedBy,
            lootedFromAlliance,
            lootedFromGuild,
            lootedFrom,
            itemId,
            itemName,
            amount,
            tier,
            category,
            subcategory
          }

          lootLogs.push(log)
        }
      }

      lootLogs.sort((l1, l2) => l1.lootedAt - l2.lootedAt)

      let chestLogs = [...state.chestLogs]

      for (const file of uploadedFiles.filter(e => e.type === 'chest-logs')) {
        const { filename } = file

        if (files[filename]) {
          chestLogs = chestLogs.filter(log => log.filename != filename)
        }

        files[filename] = true

        for (const match of file.matches) {
          const amount = parseInt(match.groups.amount, 10)

          if (amount < 0) {
            console.info("Skipping item since it has a negative amount (removed from the chest):", match.groups)
            continue
          }

          const donatedAt = strToDate(match.groups.donatedAt)
          const donatedBy = match.groups.donatedBy
          const itemName = match.groups.itemName
          const itemEnchant = parseInt(match.groups.itemEnchant, 10)

          const info = Items.getInfoFromName(itemName)

          if (info == null) {
            console.warn(`item not found: "${itemName}"`)
            continue
          }

          let itemId = info.id

          if (itemEnchant > 0 && itemId.indexOf('@') === -1) {
            itemId = `${itemId}@${itemEnchant}`
          }

          const tier = info.tier
          const category = info.category
          const subcategory = info.subcategory

          const log = { filename, donatedAt, donatedBy, itemId, itemName, amount, tier, category, subcategory }

          chestLogs.push(log)
        }
      }

      chestLogs.sort((l1, l2) => l1.donatedAt - l2.donatedAt)

      state.showPlayers = deepFreeze(showPlayers)
      state.files = deepFreeze(files)
      state.lootLogs = deepFreeze(lootLogs)
      state.chestLogs = deepFreeze(chestLogs)
    },
    toggleFilter(state, name) {
      if (state.filters[name] != null) {
        Vue.set(state.filters, name, !state.filters[name])
      }
    },
    setBin(state, data) {
      // for compatibility, since some bins may have this structure
      if (data.selectedPlayersLogs) {
        for (const filename in data.selectedPlayersLogs) {
          for (const playerName in data.selectedPlayersLogs[filename]) {
            Vue.set(state.showPlayers, playerName.toLowerCase(), true)
          }
        }
      }

      if (data.filters) {
        for (const filter in state.filters) {
          Vue.set(state.filters, filter, !!data.filters[filter])
        }
      }

      if (data.files) {
        Vue.set(state, 'files', data.files)
      }

      if (data.showPlayers) {
        Vue.set(state, 'showPlayers', data.showPlayers)
      }

      if (data.hidePlayers) {
        Vue.set(state, 'hidePlayers', data.hidePlayers)
      }

      Vue.set(state, 'lootLogs', deepFreeze(data.lootLogs))
      Vue.set(state, 'chestLogs', deepFreeze(data.chestLogs))
    },
    hidePlayer(state, playerName) {
      Vue.set(state.hidePlayers, playerName.toLowerCase(), true)
    }
  },
  getters: {
    disabledShare(state, getters) {
      return state.sharing || !getters.hasFiles || state.blockSharing || !database.valid
    },
    hasFiles(state) {
      return Object.keys(state.files).length > 0
    },
    allPlayers(state, getters) {
      const players = {}

      // PICK UP ITEMS
      for (const loot of getters.filteredLoot) {
        if (players[loot.lootedBy.toLowerCase()] == null) {
          players[loot.lootedBy.toLowerCase()] = {
            name: loot.lootedBy,
            alliance: null,
            guild: null,
            amountOfPickedUpItems: 0,
            pickedUpItems: {},
            resolvedItems: {},
            lostItems: {},
            donatedItems: {}
          }
        }

        if (loot.lootedByAlliance && players[loot.lootedBy.toLowerCase()].alliance !== loot.lootedByAlliance) {
          players[loot.lootedBy.toLowerCase()].alliance = loot.lootedByAlliance
        }

        if (loot.lootedByGuild && players[loot.lootedBy.toLowerCase()].guild !== loot.lootedByGuild) {
          players[loot.lootedBy.toLowerCase()].guild = loot.lootedByGuild
        }

        if (players[loot.lootedBy.toLowerCase()].pickedUpItems[loot.itemId] == null) {
          players[loot.lootedBy.toLowerCase()].pickedUpItems[loot.itemId] = {
            id: loot.itemId,
            amount: 0,
            history: []
          }
        }

        players[loot.lootedBy.toLowerCase()].amountOfPickedUpItems += 1

        players[loot.lootedBy.toLowerCase()].pickedUpItems[loot.itemId].amount += loot.amount
        players[loot.lootedBy.toLowerCase()].pickedUpItems[loot.itemId].history.push(loot)
      }

      // LOST ITEMS
      for (const loot of getters.filteredLoot) {
        if (players[loot.lootedFrom.toLowerCase()] == null) {
          players[loot.lootedFrom.toLowerCase()] = {
            name: loot.lootedFrom,
            amountOfPickedUpItems: 0,
            pickedUpItems: {},
            resolvedItems: {},
            lostItems: {},
            donatedItems: {}
          }
        }

        const player = players[loot.lootedFrom.toLowerCase()]

        player.died = true

        if (player.lostItems[loot.itemId] == null) {
          player.lostItems[loot.itemId] = {
            id: loot.itemId,
            amount: 0,
            history: []
          }
        }

        player.lostItems[loot.itemId].amount += loot.amount
        player.lostItems[loot.itemId].history.push(loot)

        // if the lost item was picked up, it needs to subtract and create/increment a "resolved" item
        if (player.pickedUpItems[loot.itemId] != null) {
          if (player.resolvedItems[loot.itemId] == null) {
            player.resolvedItems[loot.itemId] = {
              id: loot.itemId,
              amount: 0,
              history: []
            }
          }

          player.resolvedItems[loot.itemId].amount += loot.amount
          player.resolvedItems[loot.itemId].history.push({
            amount: loot.amount,
            at: loot.lootedAt,
            str: `picked up but lost to ${loot.lootedBy}`
          })

          if (loot.amount >= player.pickedUpItems[loot.itemId].amount) {
            delete player.pickedUpItems[loot.itemId]
          } else {
            player.pickedUpItems[loot.itemId].amount -= loot.amount
          }
        }
      }

      // DONATED ITEMS
      for (const donation of getters.filteredDonations) {
        if (players[donation.donatedBy.toLowerCase()] == null) {
          players[donation.donatedBy.toLowerCase()] = {
            name: donation.donatedBy,
            amountOfPickedUpItems: 0,
            pickedUpItems: {},
            resolvedItems: {},
            lostItems: {},
            donatedItems: {}
          }
        }

        const player = players[donation.donatedBy.toLowerCase()]

        // initially, we consider that every item donated is an extra item.
        // As we don't know if the user picked up this item yet.
        let extraItemsDonated = donation.amount

        if (player.pickedUpItems[donation.itemId] != null) {
          if (player.resolvedItems[donation.itemId] == null) {
            player.resolvedItems[donation.itemId] = {
              id: donation.itemId,
              amount: 0,
              history: [],
              category: donation.category,
              subcategory: donation.subcategory
            }
          }

          const pickedUpItem = player.pickedUpItems[donation.itemId]
          const resolvedItem = player.resolvedItems[donation.itemId]

          // now that we know this user donated some of this item, update `extraItemsDonated`
          extraItemsDonated -= pickedUpItem.amount

          resolvedItem.amount += donation.amount
          resolvedItem.history.push({
            amount: donation.amount,
            at: donation.donatedAt,
            str: `picked up and donated`
          })

          if (donation.amount >= pickedUpItem.amount) {
            delete player.pickedUpItems[donation.itemId]
          } else {
            pickedUpItem.amount -= donation.amount
          }
        }

        // if after considering the picked up items, we still have extra items donated, add them to
        // the donated list.
        if (extraItemsDonated) {
          if (player.donatedItems[donation.itemId] == null) {
            player.donatedItems[donation.itemId] = {
              id: donation.itemId,
              amount: 0,
              history: [],
              category: donation.category,
              subcategory: donation.subcategory
            }
          }

          player.donatedItems[donation.itemId].amount += donation.amount
          player.donatedItems[donation.itemId].history.push(donation)
        }
      }

      for (const playerName in players) {
        const player = players[playerName.toLowerCase()]

        player.amountOfPickedUpItems = 0

        for (const itemId in player.pickedUpItems) {
          player.amountOfPickedUpItems += player.pickedUpItems[itemId].amount
        }

        player.amountOfResolvedItems = 0

        for (const itemId in player.resolvedItems) {
          player.amountOfResolvedItems += player.resolvedItems[itemId].amount
        }

        player.amountOfLostItems = 0

        for (const itemId in player.lostItems) {
          player.amountOfLostItems += player.lostItems[itemId].amount
        }

        player.amountOfDonatedItems = 0

        for (const itemId in player.donatedItems) {
          player.amountOfDonatedItems += player.donatedItems[itemId].amount
        }
      }

      // filter players that didn't picked up anything
      for (const playerName in players) {
        const player = players[playerName.toLowerCase()]

        if (player.amountOfPickedUpItems) {
          continue
        }

        if (state.filters.resolved && player.amountOfResolvedItems) {
          continue
        }

        if (state.filters.donated && player.amountOfDonatedItems) {
          continue
        }

        delete players[playerName]
      }

      const allPlayersFrozen = deepFreeze(players)

      return allPlayersFrozen
    },
    filteredPlayers(state, getters) {
      const players = {}
      const hasShowPlayers = Object.keys(state.showPlayers).length > 0

      for (const playerName in getters.allPlayers) {
        const lowerPlayerName = playerName.toLowerCase()

        if (state.hidePlayers[lowerPlayerName]) {
          continue
        }

        if (hasShowPlayers && !state.showPlayers[lowerPlayerName]) {
          continue
        }

        players[lowerPlayerName] = getters.allPlayers[playerName]
      }

      return players
    },
    sortedFilteredPlayers(state, getters) {
      return Object.values(getters.filteredPlayers)
        .sort((a, b) => {
          if (a.amountOfPickedUpItems !== b.amountOfPickedUpItems) {
            return b.amountOfPickedUpItems - a.amountOfPickedUpItems
          }

          if (state.filters.resolved && a.amountOfResolvedItems !== b.amountOfResolvedItems) {
            return b.amountOfResolvedItems - a.amountOfResolvedItems
          }

          if (state.filters.donated && a.amountOfDonatedItems !== b.amountOfDonatedItems) {
            return b.amountOfDonatedItems - a.amountOfDonatedItems
          }

          return 0
        })
        .map(p => p.name.toLowerCase())
    },
    uniqueLootLogs(state) {
      const uniqueLootLogs = []
      const searchIndex = {}

      for (const log of state.lootLogs) {
        if (searchIndex[log.lootedBy] == null) {
          searchIndex[log.lootedBy] = {}
        }

        if (searchIndex[log.lootedBy][log.lootedFrom] == null) {
          searchIndex[log.lootedBy][log.lootedFrom] = {}
        }

        if (searchIndex[log.lootedBy][log.lootedFrom][log.itemId] == null) {
          searchIndex[log.lootedBy][log.lootedFrom][log.itemId] = {}
        }

        if (searchIndex[log.lootedBy][log.lootedFrom][log.itemId][log.amount] == null) {
          searchIndex[log.lootedBy][log.lootedFrom][log.itemId][log.amount] = []
        }

        const isDuplicate = searchIndex[log.lootedBy][log.lootedFrom][log.itemId][log.amount].some(
          date => Math.abs(date.diff(log.lootedAt)) <= 120000
        )

        if (!isDuplicate) {
          searchIndex[log.lootedBy][log.lootedFrom][log.itemId][log.amount].push(log.lootedAt)

          uniqueLootLogs.push(log)
        }
      }

      const uniqueLootLogsFrozen = deepFreeze(uniqueLootLogs)

      return uniqueLootLogsFrozen
    },
    filteredLoot(state, getters) {
      const filteredLoot = getters.uniqueLootLogs.filter(loot => shouldFilterItem(loot, state.filters))

      const filteredLootFrozen = deepFreeze(filteredLoot)

      return filteredLootFrozen
    },
    filteredDonations(state) {
      const filteredDonations = state.chestLogs.filter(loot => shouldFilterItem(loot, state.filters))

      const filteredDonationsFrozen = deepFreeze(filteredDonations)

      return filteredDonationsFrozen
    }
  },
  actions: {
    async upload({ commit, state }, event) {
      document.body.classList.remove('dragover')

      if (!state.initialized) {
        return iziToast.error({
          title: 'Error',
          message: 'The app is still loading. Try again in a few seconds.',
          progressBarColor: 'red',
          titleColor: 'red'
        })
      }

      if (state.loadingBin || state.blockUpload) {
        return iziToast.error({
          title: 'Error',
          message: 'Upload is blocked.',
          progressBarColor: 'red',
          titleColor: 'red'
        })
      }

      const droppedFiles = Array.from(event.dataTransfer ? event.dataTransfer.files : event.target.files)

      const promises = droppedFiles.map(file => {
        return new Promise(resolve => {
          const encodingReader = new FileReader()
          const contentReader = new FileReader()

          encodingReader.onload = evt => {
            const filecontent = evt.target.result.split(/\r|\n|\r\n/)
            const detection = jschardet.detect(filecontent.toString())
            const encoding = detection.confidence >= 0.2 ? detection.encoding : 'UTF-8'

            console.info(`Charset detected for ${file.name}:`, detection)
            console.info(`Charset used for ${file.name}:`, encoding)

            contentReader.readAsText(file, encoding)
          }

          contentReader.onload = evt => {
            const content = evt.target.result

            console.log({ content })

            return resolve({ filename: file.name, content })
          }

          encodingReader.readAsBinaryString(file)
        })
      })

      const files = await Promise.all(promises)

      const matches = files.map(file => getMatchesFromFile(file)).filter(matches => matches != null)

      commit('uploadedFiles', matches)
    },
    async share({ commit, state }, block = true) {
      if (state.sharing) {
        return
      }

      commit('setSharing', true)

      if (Items.sha === 'master') {
        try {
          await Items.loadSHA()
        } catch (error) {
          console.error(error)

          commit('setSharing', false)

          return iziToast.error({
            title: 'Error',
            message: 'Sorry. You can only share 60 bins a hour. Come back later.',
            progressBarColor: 'red',
            titleColor: 'red'
          })
        }
      }

      const data = compressData({
        blockSharing: block,
        blockUpload: block,
        filters: state.filters,
        files: state.files,
        showPlayers: state.showPlayers,
        hidePlayers: state.hidePlayers,
        lootLogs: state.lootLogs,
        chestLogs: state.chestLogs
      })

      try {
        const bin = await database.create(data)

        router.replace(`/${bin}`)

        iziToast.success({
          title: 'Success',
          message: 'URL copied to clipboard.',
          progressBarColor: 'green',
          titleColor: 'green'
        })

        copyToClipboard(location.toString())
      } catch (error) {
        console.error(error)

        if (error?.response?.status === 403 && error?.response?.message?.indexOf('500kb') !== -1) {
          iziToast.error({
            title: 'Error',
            message: 'The payload exceeds the database limit. :(',
            progressBarColor: 'red',
            titleColor: 'red'
          })
        } else if (error?.response?.status === 403 && error?.response?.message?.indexOf('Requests exhausted') !== -1) {
          iziToast.error({
            title: 'Error',
            message: 'The free database is exausted. :(',
            progressBarColor: 'red',
            titleColor: 'red'
          })
        } else {
          iziToast.error({
            title: 'Error',
            message: error.message || 'Something went wrong. :(',
            progressBarColor: 'red',
            titleColor: 'red'
          })
        }
      }

      commit('setSharing', false)
      commit('setBlockSharing', block)
    }
  }
})

function getMatchesFromFile(file) {
  const patterns = [
    { re: regex.chestLogSsvRe, type: 'chest-logs' },
    { re: regex.v2LootLogRe, type: 'loot-logs' },
    { re: regex.aoLootLogRe, type: 'loot-logs' },
    { re: regex.albionAnalysisLootLogRe, type: 'loot-logs' },
    { re: regex.lootLogRe, type: 'loot-logs' },
    { re: regex.chestLogRe, type: 'chest-logs' },
    { re: regex.chestLogCsvRe, type: 'chest-logs' },
    { re: regex.guildMemberLogRe, type: 'show-players' }
  ]

  const content = file.content.trim()
  const totalLines = content.split("\n").length

  for (const pattern of patterns) {
    const matches = [...content.matchAll(pattern.re)]

    if (matches.length) {
      console.info(`Found ${matches.length} ${pattern.type} matches out of ${totalLines} lines in ${file.filename}`)

      if (matches.length < totalLines) {
        const nonMatches = content.split('\n')
          .map(line => line.trim())
          .filter(line => !line.match(pattern.re))

        console.info('Skipped lines:', nonMatches)
      }

      return { matches, filename: file.filename, type: pattern.type }
    }
  }

  return iziToast.error({
    title: 'Error',
    message: `No matches for ${file.filename}`,
    progressBarColor: 'red',
    titleColor: 'red'
  })
}

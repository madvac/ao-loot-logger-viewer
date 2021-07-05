import Vue from 'vue'
import Vuex from 'vuex'
import VuexPersistence from 'vuex-persist'

import deepFreeze from '../utils/deepFreeze'
import Items from '../services/items'
import { strToDate } from '../utils/date'
import shouldFilterItem from '../services/should-filter-item'

Vue.use(Vuex)

const VERSION = 1

const vuexLocal = new VuexPersistence({
  key: 'ao-loot-logger-viewer',
  storage: window.localStorage,
  reducer: state => ({ VERSION, filters: state.filters }),
  restoreState: (key, storage) => {
    let state

    try {
      state = JSON.parse(storage[key])
    } catch {
      return null
    }

    if (state.VERSION !== VERSION) {
      return null
    }

    return state
  },
  filter: mutation => (mutation.type = 'toggleFilter')
})

export default new Vuex.Store({
  strict: true,
  plugins: [vuexLocal.plugin],
  state: {
    showPlayers: {},
    hidePlayers: {},
    files: {},
    lootLogs: [],
    chestLogs: [],
    filters: {
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
  },
  mutations: {
    RESTORE_MUTATION: vuexLocal.RESTORE_MUTATION,
    reset(state) {
      state.showPlayers = {}
      state.hidePlayers = {}
      state.files = {}
      state.chestLogs = []
      state.lootLogs = []

      window.history.pushState({}, '', process.env.BASE_URL)
    },
    uploadedFiles(state, { uploadedFiles }) {
      console.time('uploadedFiles')

      const files = {
        ...state.files
      }

      const showPlayers = {
        ...state.showPlayers
      }

      for (const file of uploadedFiles.filter(e => e.type === 'show-players')) {
        if (files[file.filename]) {
          continue
        }

        files[file.filename] = true

        for (const match of file.matches) {
          const playerName = (match.groups.userName1 || match.groups.userName2).toLowerCase()

          showPlayers[playerName] = true
        }
      }

      const lootLogs = [...state.lootLogs]

      for (const file of uploadedFiles.filter(e => e.type === 'loot-logs')) {
        if (files[file.filename]) {
          continue
        }

        files[file.filename] = true

        for (const match of file.matches) {
          const lootedAt = strToDate(match.groups.lootedAt)
          const lootedBy = match.groups.lootedBy
          const itemId = match.groups.itemId
          const amount = parseInt(match.groups.amount, 10)
          const lootedFrom = match.groups.lootedFrom

          const info = Items.getInfoFromId(itemId)

          const itemName = info.name
          const tier = info.tier
          const category = info.category
          const subcategory = info.subcategory

          const log = { lootedAt, lootedBy, lootedFrom, itemId, itemName, amount, tier, category, subcategory }

          lootLogs.push(log)
        }
      }

      lootLogs.sort((l1, l2) => l1.lootedAt - l2.lootedAt)

      const chestLogs = [...state.chestLogs]

      for (const file of uploadedFiles.filter(e => e.type === 'chest-logs')) {
        if (files[file.filename]) {
          continue
        }

        files[file.filename] = true

        for (const match of file.matches) {
          const amount = parseInt(match.groups.amount, 10)

          if (amount < 0) {
            continue
          }

          const donatedAt = strToDate(match.groups.donatedAt)
          const donatedBy = match.groups.donatedBy
          const itemName = match.groups.itemName
          const itemEnchant = parseInt(match.groups.itemEnchant, 10)

          const info = Items.getInfoFromName(itemName)

          if (info == null) {
            console.error(`item not found: "${itemName}"`)
            continue
          }

          let itemId = info.id

          if (itemEnchant > 0 && itemId.indexOf('@') === -1) {
            itemId = `${itemId}@${itemEnchant}`
          }

          const tier = info.tier
          const category = info.category
          const subcategory = info.subcategory

          const log = { donatedAt, donatedBy, itemId, itemName, amount, tier, category, subcategory }

          chestLogs.push(log)
        }
      }

      chestLogs.sort((l1, l2) => l1.donatedAt - l2.donatedAt)

      state.showPlayers = deepFreeze(showPlayers)
      state.files = deepFreeze(files)
      state.lootLogs = deepFreeze(lootLogs)
      state.chestLogs = deepFreeze(chestLogs)

      console.timeEnd('uploadedFiles')
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

      if (data.showPlayers) {
        Vue.set(state, 'showPlayers', data.showPlayers)
      }

      if (data.hidePlayers) {
        Vue.set(state, 'hidePlayers', data.hidePlayers)
      }

      for (const filename in data.chestLogs) {
        Vue.set(
          state.chestLogs,
          filename,
          deepFreeze(
            data.chestLogs[filename].map(log => ({
              ...log,
              donatedAt: strToDate(log.donatedAt)
            }))
          )
        )
      }

      for (const filename in data.lootLogs) {
        Vue.set(
          state.lootLogs,
          filename,
          deepFreeze(
            data.lootLogs[filename].map(log => ({
              ...log,
              lootedAt: strToDate(log.lootedAt)
            }))
          )
        )
      }
    },
    hidePlayer(state, playerName) {
      Vue.set(state.hidePlayers, playerName.toLowerCase(), true)
    }
  },
  getters: {
    hasFiles(state) {
      return Object.keys(state.files).length > 0
    },
    allPlayers(state, getters) {
      console.time('allPlayers')

      const players = {}

      // PICK UP ITEMS
      for (const loot of getters.filteredLoot) {
        if (players[loot.lootedBy.toLowerCase()] == null) {
          players[loot.lootedBy.toLowerCase()] = {
            name: loot.lootedBy,
            amountOfPickedUpItems: 0,
            pickedUpItems: {},
            resolvedItems: {},
            lostItems: {},
            donatedItems: {}
          }
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

      console.timeEnd('allPlayers')

      return allPlayersFrozen
    },
    filteredPlayers(state, getters) {
      console.time('filteredPlayers')

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

      console.timeEnd('filteredPlayers')

      return players
    },
    uniqueLootLogs(state) {
      console.time('uniqueLootLogs')

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

      console.timeEnd('uniqueLootLogs')

      return uniqueLootLogsFrozen
    },
    filteredLoot(state, getters) {
      console.time('filteredLoot')

      const filteredLoot = getters.uniqueLootLogs.filter(loot => shouldFilterItem(loot, state.filters))

      const filteredLootFrozen = deepFreeze(filteredLoot)

      console.timeEnd('filteredLoot')

      return filteredLootFrozen
    },
    filteredDonations(state) {
      console.time('filteredDonations')

      const filteredDonations = state.chestLogs.filter(loot => shouldFilterItem(loot, state.filters))

      const filteredDonationsFrozen = deepFreeze(filteredDonations)

      console.timeEnd('filteredDonations')

      return filteredDonationsFrozen
    }
  }
})

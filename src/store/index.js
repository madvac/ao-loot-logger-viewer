import Vue from 'vue'
import Vuex from 'vuex'
import VuexPersistence from 'vuex-persist'

import deepFreeze from '../utils/deepFreeze'
import Items from '../utils/items'
import { strToDate } from '../utils/date'
import shouldFilterItem from '../utils/should-filter-item'

Vue.use(Vuex)

const vuexLocal = new VuexPersistence({
  key: 'ao-loot-logger-viewer',
  storage: window.localStorage,
  reducer: state => ({ filters: state.filters })
})

export default new Vuex.Store({
  strict: true,
  plugins: [vuexLocal.plugin],
  state: {
    lootLogs: {},
    selectedPlayersLogs: {},
    chestLogs: {},
    filters: {
      t1: false,
      t2: false,
      t3: false,
      t4: true,
      t5: true,
      t6: true,
      t7: true,
      t8: true,
      bag: false,
      cape: false,
      lost: false,
      donated: false,
      food: false,
      mount: false,
      others: false,
      resolved: false,
      potion: false,
      trash: false
    }
  },
  mutations: {
    RESTORE_MUTATION: vuexLocal.RESTORE_MUTATION,
    reset(state) {
      state.lootLogs = {}
      state.selectedPlayersLogs = {}
      state.chestLogs = {}
    },
    addLootLogs(state, { filename, matches }) {
      const loot = []

      for (const match of matches) {
        const lootedAt = strToDate(match.groups.lootedAt)
        const lootedBy = match.groups.lootedBy
        const itemId = match.groups.itemId
        const amount = parseInt(match.groups.amount, 10)
        const lootedFrom = match.groups.lootedFrom

        const info = Items.getInfoFromId(itemId)

        const tier = info.tier
        const category = info.category
        const subcategory = info.subcategory

        const log = { lootedAt, lootedBy, itemId, amount, lootedFrom, tier, category, subcategory }

        loot.push(log)
      }

      Vue.set(state.lootLogs, filename, deepFreeze(loot))
    },
    addSelectedPlayersLogs(state, { filename, matches }) {
      const selectedPlayers = []

      for (const match of matches) {
        const playerName = (match.groups.userName1 || match.groups.userName2).toLowerCase()

        const player = { playerName }

        selectedPlayers.push(player)
      }

      Vue.set(state.selectedPlayersLogs, filename, deepFreeze(selectedPlayers))
    },
    addChestLogs(state, { filename, matches }) {
      const donations = []

      for (const match of matches) {
        const donatedAt = strToDate(match.groups.donatedAt)
        const donatedBy = match.groups.donatedBy
        const itemName = match.groups.itemName
        const itemEnchant = parseInt(match.groups.itemEnchant, 10)
        const amount = parseInt(match.groups.amount, 10)

        const info = Items.getInfoFromName(itemName)

        const tier = info.tier
        const category = info.category
        const subcategory = info.subcategory

        let itemId = info.id

        if (itemId == null) {
          console.error(`item not found: "${itemName}"`)
          continue
        }

        if (itemEnchant > 0 && itemId.indexOf('@') === -1) {
          itemId = `${itemId}@${itemEnchant}`
        }

        if (amount > 0) {
          const log = { donatedAt, donatedBy, itemId, itemEnchant, amount, tier, category, subcategory }

          donations.push(log)
        }
      }

      Vue.set(state.chestLogs, filename, deepFreeze(donations))
    },
    toggleFilter(state, name) {
      state.filters[name] = !state.filters[name]
    },
    setBin(state, data) {
      for (const filename in data.selectedPlayersLogs) {
        Vue.set(state.selectedPlayersLogs, filename, deepFreeze(data.selectedPlayersLogs[filename]))
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
    }
  },
  getters: {
    hasFiles(state) {
      const hasChestLogs = Object.keys(state.chestLogs).length > 0
      const hasLootLogs = Object.keys(state.lootLogs).length > 0
      const hasPlayerLogs = Object.keys(state.selectedPlayersLogs).length > 0

      return hasChestLogs || hasLootLogs || hasPlayerLogs
    },
    donatedLoot(state) {
      const donatedLoot = {}

      for (const logs of Object.values(state.chestLogs)) {
        for (const line of logs) {
          const key = `${line.donatedBy} ${line.donatedAt} ${line.itemId} ${line.amount}`

          donatedLoot[key] = line
        }
      }

      const loot = Object.values(donatedLoot)

      loot.sort((a, b) => a.donatedAt - b.donatedAt)

      return deepFreeze(loot)
    },
    allPlayers(state, getters) {
      const players = {}

      // PICK UP ITEMS
      for (const loot of getters.filteredLoot) {
        if (players[loot.lootedBy] == null) {
          players[loot.lootedBy] = {
            name: loot.lootedBy,
            amountOfPickedUpItems: 0,
            pickedUpItems: {},
            resolvedItems: {},
            lostItems: {},
            donatedItems: {}
          }
        }

        if (players[loot.lootedBy].pickedUpItems[loot.itemId] == null) {
          players[loot.lootedBy].pickedUpItems[loot.itemId] = {
            id: loot.itemId,
            amount: 0,
            history: []
          }
        }

        players[loot.lootedBy].amountOfPickedUpItems += 1

        players[loot.lootedBy].pickedUpItems[loot.itemId].amount += loot.amount
        players[loot.lootedBy].pickedUpItems[loot.itemId].history.push(loot)
      }

      // LOST ITEMS
      for (const loot of getters.filteredLoot) {
        if (players[loot.lootedFrom] == null) {
          players[loot.lootedFrom] = {
            name: loot.lootedFrom,
            amountOfPickedUpItems: 0,
            pickedUpItems: {},
            resolvedItems: {},
            lostItems: {},
            donatedItems: {}
          }
        }

        const player = players[loot.lootedFrom]

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
        if (players[donation.donatedBy] == null) {
          players[donation.donatedBy] = {
            name: donation.donatedBy,
            amountOfPickedUpItems: 0,
            pickedUpItems: {},
            resolvedItems: {},
            lostItems: {},
            donatedItems: {}
          }
        }

        const player = players[donation.donatedBy]

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
        const player = players[playerName]

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
        const player = players[playerName]

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

      return deepFreeze(players)
    },
    selectedPlayers(state) {
      if (!Object.keys(state.selectedPlayersLogs).length) {
        return null
      }

      const selectedPlayers = {}

      for (const logs of Object.values(state.selectedPlayersLogs)) {
        for (const item of logs) {
          selectedPlayers[item.playerName] = true
        }
      }

      return selectedPlayers
    },
    filteredPlayers(state, getters) {
      if (!getters.selectedPlayers) {
        return getters.allPlayers
      }

      const players = {}

      for (const player in getters.allPlayers) {
        if (getters.selectedPlayers[player.toLowerCase()]) {
          players[player] = getters.allPlayers[player]
        }
      }

      return players
    },
    allLoot(state) {
      const loot = []

      for (const logs of Object.values(state.lootLogs)) {
        for (const log of logs) {
          const isDuplicate = loot.some(e => {
            // if the player looted different players, it is definetly not a duplicate.
            if (e.itemId !== log.itemId) {
              return false
            }

            if (e.lootedFrom !== log.lootedFrom) {
              return false
            }

            if (e.lootedBy !== log.lootedBy) {
              return false
            }

            if (e.amount !== log.amount) {
              return false
            }

            const diff = Math.abs(e.lootedAt.diff(log.lootedAt))

            // if looted from the same player, in a very short time window, it is
            // probably a duplicate
            return diff <= 120000
          })

          if (!isDuplicate) {
            loot.push(log)
          }
        }
      }

      loot.sort((a, b) => a.lootedAt - b.lootedAt)

      return deepFreeze(loot)
    },
    filteredLoot(state, getters) {
      const filteredLoot = getters.allLoot.filter(loot => shouldFilterItem(loot, state.filters))

      return deepFreeze(filteredLoot)
    },
    filteredDonations(state, getters) {
      const filteredDonations = getters.donatedLoot.filter(loot => shouldFilterItem(loot, state.filters))

      return deepFreeze(filteredDonations)
    },
    donationsByPlayer(state, getters) {
      const donationsByPlayer = {}

      for (const donation of getters.donatedLoot) {
        if (donationsByPlayer[donation.donatedBy] == null) {
          donationsByPlayer[donation.donatedBy] = {}
        }

        if (donationsByPlayer[donation.donatedBy][donation.itemId] == null) {
          donationsByPlayer[donation.donatedBy][donation.itemId] = {
            amount: 0,
            history: []
          }
        }

        donationsByPlayer[donation.donatedBy][donation.itemId].amount += donation.amount
        donationsByPlayer[donation.donatedBy][donation.itemId].history.push(donation)
      }

      return deepFreeze(donationsByPlayer)
    }
  }
})

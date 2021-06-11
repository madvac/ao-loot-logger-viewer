import Vue from 'vue'
import Vuex from 'vuex'
import VuexPersistence from 'vuex-persist'

import deepFreeze from '../utils/deepFreeze'
import items from '../utils/items.json'
import { strToDate } from '../utils/date'

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

        const log = { lootedAt, lootedBy, itemId, amount, lootedFrom }

        loot.push(log)
      }

      Vue.set(state.lootLogs, filename, deepFreeze(loot))
    },
    addSelectedPlayersLogs(state, { filename, matches }) {
      const selectedPlayers = []

      for (const match of matches) {
        const playerName = (
          match.groups.userName1 || match.groups.userName2
        ).toLowerCase()

        const player = { playerName }

        selectedPlayers.push(player)
      }

      Vue.set(state.selectedPlayersLogs, filename, deepFreeze(selectedPlayers))
    },
    addChestLogs(state, { filename, matches }) {
      const donations = []

      for (const match of matches) {
        const donatedAt = strToDate(match.donatedAt)
        const donatedBy = match.donatedBy
        const itemName = match.itemName
        const itemEnchant = parseInt(match.itemEnchant, 10)
        const amount = parseInt(match.amount, 10)

        let itemId = items[itemName]

        if (itemId == null) {
          console.error(`item not found: "${itemName}"`)
          continue
        }

        if (itemEnchant > 0 && itemId.indexOf('@') === -1) {
          itemId = `${itemId}@${itemEnchant}`
        }

        if (amount > 0) {
          const log = { donatedAt, donatedBy, itemId, itemEnchant, amount }

          donations.push(log)
        }
      }

      Vue.set(state.chestLogs, filename, deepFreeze(donations))
    },
    toggleFilter(state, name) {
      state.filters[name] = !state.filters[name]
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

      loot.sort((a, b) => b.itemId.localeCompare(a.itemId))

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

          player.amountOfPickedUpItems -= loot.amount
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
              history: []
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

          player.amountOfPickedUpItems -= donation.amount
        }

        // after considering the picked up items we still have extra items donated, add it the out list.
        if (extraItemsDonated) {
          if (player.donatedItems[donation.itemId] == null) {
            player.donatedItems[donation.itemId] = {
              id: donation.itemId,
              amount: 0,
              history: []
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

        if (Object.keys(player.pickedUpItems).length > 0) {
          continue
        }

        if (
          state.filters.resolved &&
          Object.keys(player.resolvedItems).length > 0
        ) {
          continue
        }

        if (
          state.filters.donated &&
          Object.keys(player.donatedItems).length > 0
        ) {
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

      // for (const player of getters.selectedPlayers) {
      //   if (getters.allPlayers[player]) {
      //     players[player] = getters.allPlayers[player]
      //   }
      // }

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

      loot.sort((a, b) => b.itemId.localeCompare(a.itemId))

      return deepFreeze(loot)
    },
    filteredLoot(state, getters) {
      const filteredLoot = getters.allLoot.filter(loot => {
        const hideItem = getters.filterPatterns.some(pattern =>
          loot.itemId.match(pattern)
        )

        return !hideItem
      })

      return deepFreeze(filteredLoot)
    },
    filteredDonations(state, getters) {
      const filteredDonations = getters.donatedLoot.filter(loot => {
        const hideItem = getters.filterPatterns.some(pattern =>
          loot.itemId.match(pattern)
        )

        return !hideItem
      })

      return deepFreeze(filteredDonations)
    },
    filterPatterns(state) {
      const filterPatterns = []

      if (!state.filters.t2) {
        filterPatterns.push(/^T2/)
      }

      if (!state.filters.t3) {
        filterPatterns.push(/^T3/)
      }

      if (!state.filters.t4) {
        filterPatterns.push(/^T4/)
      }

      if (!state.filters.t5) {
        filterPatterns.push(/^T5/)
      }

      if (!state.filters.t6) {
        filterPatterns.push(/^T6/)
      }

      if (!state.filters.t7) {
        filterPatterns.push(/^T7/)
      }

      if (!state.filters.t8) {
        filterPatterns.push(/^T8/)
      }

      if (!state.filters.trash) {
        filterPatterns.push(/_TRASH/)
      }

      if (!state.filters.bag) {
        filterPatterns.push(/_BAG/)
        filterPatterns.push(/_BAG_INSIGHT/)
      }

      if (!state.filters.potion) {
        filterPatterns.push(/_POTION_/)
      }

      if (!state.filters.food) {
        filterPatterns.push(/_FISH_FRESHWATER_/)
        filterPatterns.push(/_FISH_SALTWATER_/)
        filterPatterns.push(/_MEAL_/)
      }

      if (!state.filters.cape) {
        filterPatterns.push(/^T\d_CAPE(?:@\d)?$/)

        filterPatterns.push(/^T\d_CAPEITEM_FW_BRIDGEWATCH(?:@\d)?$/)
        filterPatterns.push(/^T\d_CAPEITEM_FW_FORTSTERLING(?:@\d)?$/)
        filterPatterns.push(/^T\d_CAPEITEM_FW_LYMHURST(?:@\d)?$/)
        filterPatterns.push(/^T\d_CAPEITEM_FW_MARTLOCK(?:@\d)?$/)
        filterPatterns.push(/^T\d_CAPEITEM_FW_THETFORD(?:@\d)?$/)

        filterPatterns.push(/^T\d_CAPEITEM_DEMON(?:@\d)?$/)
        filterPatterns.push(/^T\d_CAPEITEM_HERETIC(?:@\d)?$/)
        filterPatterns.push(/^T\d_CAPEITEM_KEEPER(?:@\d)?$/)
        filterPatterns.push(/^T\d_CAPEITEM_MORGANA(?:@\d)?$/)
        filterPatterns.push(/^T\d_CAPEITEM_UNDEAD(?:@\d)?$/)
      }

      if (!state.filters.mount) {
        filterPatterns.push(/_MOUNT_ARMORED_HORSE_MORGANA@1/)
        filterPatterns.push(/_MOUNT_ARMORED_HORSE/)
        filterPatterns.push(/_MOUNT_COUGAR_KEEPER@1/)
        filterPatterns.push(/_MOUNT_DIREBEAR_FW_FORTSTERLING/)
        filterPatterns.push(/_MOUNT_DIREBEAR/)
        filterPatterns.push(/_MOUNT_DIREBOAR_FW_LYMHURST/)
        filterPatterns.push(/_MOUNT_DIREBOAR/)
        filterPatterns.push(/_MOUNT_DIREWOLF/)
        filterPatterns.push(/_MOUNT_FROSTRAM_ADC/)
        filterPatterns.push(/_MOUNT_GIANTSTAG_MOOSE/)
        filterPatterns.push(/_MOUNT_GIANTSTAG/)
        filterPatterns.push(/_MOUNT_HORSE_UNDEAD@1/)
        filterPatterns.push(/_MOUNT_HORSE/)
        filterPatterns.push(/_MOUNT_HUSKY_ADC/)
        filterPatterns.push(/_MOUNT_MOABIRD_FW_BRIDGEWATCH/)
        filterPatterns.push(/_MOUNT_MONITORLIZARD_ADC/)
        filterPatterns.push(/_MOUNT_MULE/)
        filterPatterns.push(/_MOUNT_OX/)
        filterPatterns.push(/_MOUNT_RAM_FW_MARTLOCK/)
        filterPatterns.push(/_MOUNT_SWAMPDRAGON_FW_THETFORD/)
        filterPatterns.push(/_MOUNT_SWAMPDRAGON/)
        filterPatterns.push(/_MOUNT_TERRORBIRD_ADC/)
        filterPatterns.push(/T5_MOUNT_DIREBEAR_FW_FORTSTERLING/)
        filterPatterns.push(/T5_MOUNT_DIREBOAR_FW_LYMHURST/)
        filterPatterns.push(/T5_MOUNT_GREYWOLF_FW_CAERLEON/)
        filterPatterns.push(/T5_MOUNT_MOABIRD_FW_BRIDGEWATCH/)
        filterPatterns.push(/T5_MOUNT_RAM_FW_MARTLOCK/)
        filterPatterns.push(/T5_MOUNT_SWAMPDRAGON_FW_THETFORD/)
        filterPatterns.push(/T8_MOUNT_DIREBEAR_FW_FORTSTERLING_ELITE/)
        filterPatterns.push(/T8_MOUNT_DIREBOAR_FW_LYMHURST_ELITE/)
        filterPatterns.push(/T8_MOUNT_GREYWOLF_FW_CAERLEON_ELITE/)
        filterPatterns.push(/T8_MOUNT_MOABIRD_FW_BRIDGEWATCH_ELITE/)
        filterPatterns.push(/T8_MOUNT_RAM_FW_MARTLOCK_ELITE/)
        filterPatterns.push(/T8_MOUNT_SWAMPDRAGON_FW_THETFORD_ELITE/)
        filterPatterns.push(/UNIQUE_MOUNT_BAT_PERSONAL/)
        filterPatterns.push(/UNIQUE_MOUNT_BEAR_KEEPER_ADC/)
        filterPatterns.push(/UNIQUE_MOUNT_BLACK_PANTHER_ADC/)
        filterPatterns.push(/UNIQUE_MOUNT_DIVINE_OWL_ADC/)
        filterPatterns.push(/UNIQUE_MOUNT_GIANT_HORSE_ADC/)
        filterPatterns.push(/UNIQUE_MOUNT_HERETIC_MULE_ADC/)
        filterPatterns.push(/UNIQUE_MOUNT_MORGANA_RAVEN_ADC/)
        filterPatterns.push(/UNIQUE_MOUNT_UNDEAD_DIREBOAR_ADC/)
      }

      if (!state.filters.others) {
        filterPatterns.push(/_ARTEFACT_/)

        filterPatterns.push(/_ESSENCE/)
        filterPatterns.push(/_RELIC/)
        filterPatterns.push(/_RUNE/)
        filterPatterns.push(/_SHARD_AVALONIAN/)
        filterPatterns.push(/_SOUL/)

        filterPatterns.push(/_RANDOM_DUNGEON_ELITE_TOKEN_/)
        filterPatterns.push(/_RANDOM_DUNGEON_SOLO_TOKEN_/)
        filterPatterns.push(/_RANDOM_DUNGEON_TOKEN_/)

        filterPatterns.push(/_FARM/)
        filterPatterns.push(/_GVGTOKEN_/)
        filterPatterns.push(/_JOURNAL_/)
        filterPatterns.push(/_SEAWEED/)
        filterPatterns.push(/_SKILLBOOK/)
        filterPatterns.push(/_TOOL_/)
        filterPatterns.push(/_VANITY_/)
        filterPatterns.push(/FURNITUREITEM/)
        filterPatterns.push(/QUESTITEM_EXP_TOKEN/)
        filterPatterns.push(/QUESTITEM_TOKEN/)
        filterPatterns.push(/TREASURE/)

        filterPatterns.push(/_EVENT_EASTER_/)

        filterPatterns.push(/T\d_CLOTH/)
        filterPatterns.push(/T\d_FIBER/)
        filterPatterns.push(/T\d_HIDE/)
        filterPatterns.push(/T\d_LEATHER/)
        filterPatterns.push(/T\d_METALBAR/)
        filterPatterns.push(/T\d_ORE/)
        filterPatterns.push(/T\d_PLANKS/)
        filterPatterns.push(/T\d_ROCK/)
        filterPatterns.push(/T\d_STONEBLOCK/)
        filterPatterns.push(/T\d_WOOD/)
      }

      return deepFreeze(filterPatterns)
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

        donationsByPlayer[donation.donatedBy][donation.itemId].amount +=
          donation.amount
        donationsByPlayer[donation.donatedBy][donation.itemId].history.push(
          donation
        )
      }

      return deepFreeze(donationsByPlayer)
    }
  }
})

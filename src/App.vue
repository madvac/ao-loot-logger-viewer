<template>
  <div class="home" @drop.prevent="drop" @dragover.prevent>
    <h3>Loot Logger Viewer</h3>

    <Filters />

    <table
      id="loot-table"
      class="table table-bordered"
      v-if="sortedFilteredPlayers.length"
    >
      <thead>
        <tr>
          <th>Name</th>
          <th>Items</th>
        </tr>
      </thead>
      <tbody>
        <PlayerLoot
          v-for="playerName in sortedFilteredPlayers"
          :key="playerName"
          :name="filteredPlayers[playerName].name"
          :died="filteredPlayers[playerName].died"
          :picked-up-items="filteredPlayers[playerName].pickedUpItems"
          :resolved-items="
            filters.resolved ? filteredPlayers[playerName].resolvedItems : {}
          "
          :lost-items="
            filters.lost ? filteredPlayers[playerName].lostItems : {}
          "
          :donated-items="
            filters.donated ? filteredPlayers[playerName].donatedItems : {}
          "
        />
      </tbody>
    </table>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'

import PlayerLoot from './components/PlayerLoot.vue'
import Filters from './components/Filters.vue'
import regex from './utils/regex'

export default {
  name: 'App',
  components: {
    PlayerLoot,
    Filters
  },
  computed: {
    ...mapState(['filters']),
    ...mapGetters(['filteredPlayers']),
    sortedFilteredPlayers() {
      return Object.values(this.filteredPlayers)
        .sort((a, b) => {
          if (a.amountOfPickedUpItems !== b.amountOfPickedUpItems) {
            return b.amountOfPickedUpItems - a.amountOfPickedUpItems
          }

          if (
            this.filters.resolved &&
            a.amountOfResolvedItems !== b.amountOfResolvedItems
          ) {
            return b.amountOfResolvedItems - a.amountOfResolvedItems
          }

          if (
            this.filters.donated &&
            a.amountOfDonatedItems !== b.amountOfDonatedItems
          ) {
            return b.amountOfDonatedItems - a.amountOfDonatedItems
          }

          return 0
        })
        .map((p) => p.name)
    }
  },
  methods: {
    drop(event) {
      const droppedFiles = Array.from(event.dataTransfer.files)

      for (const file of droppedFiles) {
        const reader = new FileReader()

        reader.onload = (evt) => this.processFile(evt.target.result)

        reader.readAsText(file, 'UTF-8')
      }
    },
    processFile(content) {
      const lines = content.trim().split('\n')

      if (!lines.length) {
        return
      }

      const head = lines[0]

      let result = regex.lootLogRe.exec(head)

      if (result) {
        return this.processLoot(lines.slice(1))
      }

      result = regex.chestLogRe.exec(head)

      if (result) {
        return this.processChestLog(lines.slice(1))
      }

      result = regex.guildMemberLogRe.exec(head)

      if (result) {
        return this.processGuildMembers(lines.slice(1))
      }
    },
    processLoot(lines) {
      this.$store.commit('addLootLogs', lines)
    },
    processGuildMembers(lines) {
      this.$store.commit('addSelectedPlayersLogs', lines)
    },
    processChestLog(lines) {
      this.$store.commit('addChestLogs', lines)
    }
  }
}
</script>

<style>
html,
body,
.home {
  min-height: 100vh;
  width: 100%;
}

.home {
  display: flex;
  align-items: center;
  flex-direction: column;
  padding-top: 16px;
}

#loot-table {
  width: 80%;
  max-width: 1280px;
  margin-bottom: 32px;
}

table {
  border-collapse: collapse;
  border-spacing: 0px;
}

th {
  padding: 8px;
  text-align: center;
  min-width: 200px;
  vertical-align: middle;
}
</style>

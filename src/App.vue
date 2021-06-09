<template>
  <div
    class="home"
    @drop.prevent="drop"
    @dragover.prevent="dragover"
    @dragleave.prevent="dragleave"
  >
    <Logo :small="smallLogo" @click="reset" />

    <div class="content" v-if="sortedFilteredPlayers.length">
      <Filters />

      <table id="loot-table" class="table table-bordered">
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

    <div class="content file-upload" v-else>
      <input
        class="form-control"
        type="file"
        name="file-upload"
        id="file-upload"
        accept=".txt,.csv"
        multiple
        @change="drop"
      />
    </div>

    <Footer />

    <GitHubCorner />
  </div>
</template>

<script>
import { mapGetters, mapMutations, mapState } from 'vuex'

import Filters from './components/Filters.vue'
import Footer from './components/Footer.vue'
import GitHubCorner from './components/GitHubCorner.vue'
import PlayerLoot from './components/PlayerLoot.vue'
import regex from './utils/regex'
import Logo from './components/Logo.vue'

export default {
  name: 'App',
  components: {
    PlayerLoot,
    Filters,
    GitHubCorner,
    Footer,
    Logo
  },
  computed: {
    ...mapState(['filters']),
    ...mapGetters(['filteredPlayers', 'hasFiles']),
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
    },
    smallLogo() {
      return !!this.sortedFilteredPlayers.length
    }
  },
  methods: {
    ...mapMutations(['reset']),
    dragover() {
      document.body.classList.add('dragover')
    },
    dragleave() {
      document.body.classList.remove('dragover')
    },
    drop(event) {
      document.body.classList.remove('dragover')

      const droppedFiles = Array.from(
        event.dataTransfer ? event.dataTransfer.files : event.target.files
      )

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

<style lang="scss">
:root {
  --primary-color: #ffaa00;
  --secondary-color: #009ff6;

  --font-color: #f0e7d5;

  --background-color: #252525;

  --brand-color: #ffaa00;
  --brand-color-hover: --secondary-color;
  --brand-color-visited: #ffdd00;
}

html,
body {
  display: flex;
  justify-content: center;
  align-items: stretch;
  min-height: 100%;
  min-width: 100%;
  color: var(--font-color);
  background-color: var(--background-color);
}

body {
  padding: 1rem;
}

.home {
  width: 100%;
  display: flex;
  align-items: center;
  flex-direction: column;
  border: 3px dashed var(--background-color);
  transition: border-color 300ms ease-in-out;
}

a {
  color: var(--primary-color);
  text-decoration: none;

  &:visited {
    color: var(--primary-color);
  }

  &:hover {
    color: var(--secondary-color);
  }
}

.dragover .home {
  border-color: var(--primary-color);
}

#loot-table {
  border-collapse: collapse;
  color: var(--font-color);
  border-spacing: 0px;
}

.content {
  flex: 1 0 auto;
  width: 80%;
  max-width: 1280px;
  margin-bottom: 32px;
  display: flex;
  flex-direction: column;
  align-items: center;

  &.file-upload {
    input.form-control {
      max-width: 350px;
      margin-top: 30%;
      margin-bottom: 2rem;
    }
  }
}

table {
  border-color: transparent !important;
  background-color: rgba(0, 0, 0, 0.25);
  border-radius: 5px;

  thead {
    color: var(--primary-color);
  }

  tr:nth-child(2n + 2) {
    background-color: rgba(0, 0, 0, 0.1);
  }
}

th {
  padding: 8px;
  text-align: center;
  min-width: 200px;
  vertical-align: middle;
}
</style>

<template>
  <div class="home" @drop.prevent="drop" @dragover.prevent="dragover" @dragleave.prevent="dragleave">
    <Logo :small="hasFiles" @click="reset" />

    <div class="content" v-if="hasFiles">
      <Filters />

      <table id="loot-table" class="table table-bordered" v-if="sortedFilteredPlayers.length">
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
            :resolved-items="filters.resolved ? filteredPlayers[playerName].resolvedItems : {}"
            :lost-items="filters.lost ? filteredPlayers[playerName].lostItems : {}"
            :donated-items="filters.donated ? filteredPlayers[playerName].donatedItems : {}"
          />
        </tbody>
      </table>

      <div v-else class="no-players">
        <p>No loot to display.</p>
        <p>Update the filters or upload more files.</p>
      </div>
    </div>

    <div class="content file-upload">
      <Upload @change="drop" :popup="hasFiles" />

      <a href="#faq" v-if="!hasFiles">Read the FAQ</a>

      <FAQ v-if="!hasFiles" />
    </div>

    <Footer />

    <GitHubCorner />
  </div>
</template>

<script>
import { mapGetters, mapMutations, mapState } from 'vuex'
import iziToast from 'izitoast'

import Filters from './components/Filters.vue'
import Footer from './components/Footer.vue'
import GitHubCorner from './components/GitHubCorner.vue'
import PlayerLoot from './components/PlayerLoot.vue'
import regex from './utils/regex'
import Logo from './components/Logo.vue'
import FAQ from './components/FAQ.vue'
import Upload from './components/Upload.vue'

export default {
  name: 'App',
  components: {
    PlayerLoot,
    Filters,
    GitHubCorner,
    Footer,
    Logo,
    FAQ,
    Upload
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

          if (this.filters.resolved && a.amountOfResolvedItems !== b.amountOfResolvedItems) {
            return b.amountOfResolvedItems - a.amountOfResolvedItems
          }

          if (this.filters.donated && a.amountOfDonatedItems !== b.amountOfDonatedItems) {
            return b.amountOfDonatedItems - a.amountOfDonatedItems
          }

          return 0
        })
        .map((p) => p.name)
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

      const droppedFiles = Array.from(event.dataTransfer ? event.dataTransfer.files : event.target.files)

      for (const file of droppedFiles) {
        const reader = new FileReader()

        reader.onload = (evt) => this.processFile(file.name, evt.target.result)

        reader.readAsText(file, 'UTF-8')
      }
    },
    processFile(filename, content) {
      const logs = content.trim()

      let matches = [...logs.matchAll(regex.aoLootLogRe)]

      if (matches.length) {
        return this.$store.commit('addLootLogs', {
          filename,
          matches
        })
      }

      matches = [...logs.matchAll(regex.lootLogRe)]

      if (matches.length) {
        return this.$store.commit('addLootLogs', {
          filename,
          matches
        })
      }

      matches = [...logs.matchAll(regex.chestLogRe)]

      if (matches.length) {
        return this.$store.commit('addChestLogs', {
          filename,
          matches
        })
      }

      matches = [...logs.matchAll(regex.guildMemberLogRe)]

      if (matches.length) {
        return this.$store.commit('addSelectedPlayersLogs', {
          filename,
          matches
        })
      }

      return iziToast.show({ title: 'Error', message: `No matches from this file.` })
    }
  }
}
</script>

<style lang="scss">
@import url('../node_modules/izitoast/dist/css/iziToast.min.css');

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
  min-height: 500px;
  min-width: 320px;
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

.no-players {
  background-color: rgba(0, 0, 0, 0.2);
  width: 100%;
  text-align: center;
  padding-top: 1rem;
}

.content {
  flex: 1 0 auto;
  width: 80%;
  max-width: 1280px;
  margin-bottom: 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
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

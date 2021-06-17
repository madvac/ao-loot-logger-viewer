<template>
  <div
    class="home"
    @drop.prevent="drop"
    @dragover.prevent="dragover"
    @dragleave.prevent="dragleave"
    :class="{ loading: loading || sharing || exporting }"
  >
    <div class="progress" v-if="showProgressBar">
      <div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" style="width: 100%"></div>
    </div>

    <Logo :small="hasFiles" @click="reset" />

    <div class="content" v-if="hasFiles">
      <Filters
        @share="onShare"
        @export="onExport"
        :disabledShare="sharing || !hasFiles || blockSharing"
        :disabledExport="exporting || !hasFiles"
      />

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
      <Upload @change="drop" :popup="hasFiles" :disabled="!initialized" />

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

import db from './utils/db'
import FAQ from './components/FAQ.vue'
import Filters from './components/Filters.vue'
import Footer from './components/Footer.vue'
import GitHubCorner from './components/GitHubCorner.vue'
import Items from './utils/items'
import Logo from './components/Logo.vue'
import PlayerLoot from './components/PlayerLoot.vue'
import regex from './utils/regex'
import Upload from './components/Upload.vue'

let saveAs = null

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
  data() {
    return {
      initialized: false,
      loading: false,
      sharing: false,
      exporting: false,
      blockSharing: false
    }
  },
  computed: {
    ...mapState(['filters', 'lootLogs', 'chestLogs', 'selectedPlayersLogs']),
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
    },
    showProgressBar() {
      if (this.sharing) {
        return true
      }

      if (this.initialized) {
        return false
      }

      return this.loading
    }
  },
  methods: {
    ...mapMutations(['reset', 'setBin']),
    dragover() {
      document.body.classList.add('dragover')
    },
    dragleave() {
      document.body.classList.remove('dragover')
    },
    drop(event) {
      document.body.classList.remove('dragover')

      if (!this.initialized) {
        return
      }

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

      matches = [...logs.matchAll(regex.chestLogCsvRe)]

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

      return iziToast.error({
        title: 'Error',
        message: `No matches from this file.`,
        progressBarColor: 'red',
        titleColor: 'red'
      })
    },
    async onShare() {
      if (this.sharing) {
        return
      }

      this.sharing = true

      const data = {
        selectedPlayersLogs: {},
        lootLogs: {},
        chestLogs: {}
      }

      for (const file in this.lootLogs) {
        const logs = []

        for (const item of this.lootLogs[file]) {
          logs.push({
            ...item,
            lootedAt: item.lootedAt.toISOString()
          })
        }

        data.lootLogs[file] = logs
      }

      for (const file in this.chestLogs) {
        const logs = []

        for (const item of this.chestLogs[file]) {
          logs.push({
            ...item,
            donatedAt: item.donatedAt.toISOString()
          })
        }

        data.chestLogs[file] = logs
      }

      for (const file in this.selectedPlayersLogs) {
        const players = []

        for (const player of this.selectedPlayersLogs[file]) {
          players.push({
            ...player
          })
        }

        data.selectedPlayersLogs[file] = players
      }

      let bin

      try {
        bin = await db.create(data)

        window.history.replaceState({}, '', `?b=${bin}`)

        iziToast.success({
          title: 'Success',
          message: 'Logs loaded from the database.',
          progressBarColor: 'green',
          titleColor: 'green'
        })
      } catch (error) {
        if (error?.response?.status === 403 && error?.response?.message?.indexOf('Requests exhausted') !== -1) {
          this.blockSharing = true

          iziToast.error({
            title: 'Error',
            message: 'Sorry. The free database is exausted. :(',
            progressBarColor: 'red',
            titleColor: 'red'
          })
        }
      }

      this.sharing = false
    },
    async onExport() {
      if (this.exporting) {
        return
      }

      this.exporting = true

      if (saveAs == null) {
        const fileSaver = await import('file-saver')

        saveAs = fileSaver.saveAs
      }

      let content = [`Pickup Time,Looted By,Item name,Item ID,Quantity,Looted From`]

      function template(history) {
        return `${history.lootedAt.toISOString()},${history.lootedBy},${Items.getNameFromId(history.itemId)},${
          history.itemId
        },${history.amount},${history.lootedFrom}`
      }

      for (const playerName in this.filteredPlayers) {
        const player = this.filteredPlayers[playerName]

        for (const itemId in player.pickedUpItems) {
          const item = player.pickedUpItems[itemId]

          for (const history of item.history) {
            content.push(template(history))
          }
        }
      }

      const blob = new Blob([content.join('\n')], { type: 'text/plain;charset=utf-8' })

      saveAs(blob, `ao-loot-viewer-${new Date().getTime()}.csv`)

      this.exporting = false
    }
  },
  async mounted() {
    window.items = Items
    window.iziToast = iziToast

    setTimeout(() => {
      if (!this.initialized) {
        this.loading = true

        console.log('show progress bar')
      }
    }, 1500)

    await Items.init()

    this.initialized = true
    this.loading = false

    if (this.hasFiles) {
      return
    }

    const bin = new URL(location).searchParams.get('b')

    if (bin == null) {
      return
    }

    this.loading = true

    try {
      const { record } = await db.read(bin)

      this.setBin(record)
    } catch (error) {
      if (error?.response?.status === 403 && error?.response?.message?.indexOf('Requests exhausted') !== -1) {
        iziToast.error({
          title: 'Error',
          message: 'Sorry. The free database is exausted. :(',
          progressBarColor: 'red',
          titleColor: 'red'
        })
      }
    }

    this.loading = false
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

.loading,
.loading * {
  cursor: wait !important;
}

.progress {
  position: fixed;
  bottom: 0;
  width: 100%;
  height: 0.5rem;
  border-radius: 0;
  border: 0;
  z-index: 1;

  .progress-bar {
    background-color: var(--primary-color);

    &.progress-bar-striped {
      background-image: linear-gradient(
        45deg,
        rgba(0, 0, 0, 0.2) 25%,
        transparent 25%,
        transparent 50%,
        rgba(0, 0, 0, 0.2) 50%,
        rgba(0, 0, 0, 0.2) 75%,
        transparent 75%,
        transparent
      );
    }
  }
}
</style>

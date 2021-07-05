<template>
  <div
    class="home"
    @drop.prevent="drop"
    @dragover.prevent="dragover"
    @dragleave.prevent="dragleave"
    :class="{ loading: loadingItems || loadingBin || sharing || exporting }"
  >
    <div class="progress" v-if="showProgressBar">
      <div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" style="width: 100%"></div>
    </div>

    <Logo :small="hasFiles" @click="reset" />

    <div class="content" v-if="hasFiles">
      <Filters
        @share="onShare"
        @export="onExport"
        :disabledShare="sharing || !hasFiles || blockSharing || !validDb"
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
      <Upload @change="drop" :popup="hasFiles" :disabled="!initialized || loadingBin || blockUpload" />

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

import FAQ from './components/FAQ.vue'
import Filters from './components/Filters.vue'
import Footer from './components/Footer.vue'
import GitHubCorner from './components/GitHubCorner.vue'
import Logo from './components/Logo.vue'
import PlayerLoot from './components/PlayerLoot.vue'
import Upload from './components/Upload.vue'

import Database from './services/database'
import Items from './services/items'

import { copyToClipboard, compressData, decompressData } from './utils'
import regex from './utils/regex'

let saveAs = null

const db = new Database(process.env.VUE_APP_BIN_KEY, process.env.VUE_APP_COLLECTION_ID)

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
      loadingItems: false,
      sharing: false,
      exporting: false,
      blockSharing: false,
      loadingBin: false,
      validDb: db.valid,
      blockUpload: false
    }
  },
  computed: {
    ...mapState(['filters', 'lootLogs', 'chestLogs', 'showPlayers', 'hidePlayers']),
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
        .map(p => p.name.toLowerCase())
    },
    showProgressBar() {
      if (this.sharing) {
        return true
      }

      if (this.loadingBin) {
        return true
      }

      if (this.initialized) {
        return false
      }

      return this.loadingItems
    }
  },
  methods: {
    ...mapMutations(['reset', 'setBin']),
    dragover() {
      if (!this.initialized || this.loadingBin || this.blockUpload) {
        return
      }

      document.body.classList.add('dragover')
    },
    dragleave() {
      document.body.classList.remove('dragover')
    },
    async drop(event) {
      document.body.classList.remove('dragover')

      if (!this.initialized) {
        return iziToast.error({
          title: 'Error',
          message: 'The app is still loading. Try again in a few seconds.',
          progressBarColor: 'red',
          titleColor: 'red'
        })
      }

      if (this.loadingBin || this.blockUpload) {
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
          const reader = new FileReader()

          reader.onload = evt => resolve({ filename: file.name, content: evt.target.result })

          reader.readAsText(file, 'UTF-8')
        })
      })

      const files = await Promise.all(promises)

      const matches = files.map(file => this.getMatchesFromFile(file)).filter(matches => matches != null)

      this.processMatches(matches)
    },
    processMatches(uploadedFiles) {
      this.$store.commit('uploadedFiles', { uploadedFiles })
    },
    getMatchesFromFile(file) {
      const patterns = [
        { re: regex.chestLogSsvRe, type: 'chest-logs' },
        { re: regex.aoLootLogRe, type: 'loot-logs' },
        { re: regex.lootLogRe, type: 'loot-logs' },
        { re: regex.chestLogRe, type: 'chest-logs' },
        { re: regex.chestLogCsvRe, type: 'chest-logs' },
        { re: regex.guildMemberLogRe, type: 'show-players' }
      ]

      const content = file.content.trim()

      for (const pattern of patterns) {
        const matches = [...content.matchAll(pattern.re)]

        if (matches.length) {
          return { matches, filename: file.filename, type: pattern.type }
        }
      }

      iziToast.error({
        title: 'Error',
        message: `No matches for ${file.filename}`,
        progressBarColor: 'red',
        titleColor: 'red'
      })

      return null
    },
    async onShare() {
      if (this.sharing) {
        return
      }

      this.sharing = true

      const data = compressData({
        showPlayers: this.showPlayers,
        hidePlayers: this.hidePlayers,
        lootLogs: this.lootLogs,
        chestLogs: this.chestLogs
      })

      try {
        const bin = await db.create(data)

        window.history.pushState({}, '', `?b=${bin}`)

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

      this.sharing = false
      this.blockSharing = true
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
        this.loadingItems = true
      }
    }, 1500)

    this.initialized = true
    this.loadingItems = false

    if (this.hasFiles || !this.validDb) {
      return await Items.init()
    }

    const bin = new URL(location).searchParams.get('b')

    if (bin == null) {
      return await Items.init()
    }

    this.loadingBin = true

    try {
      const { record } = await db.read(bin)

      await Items.init(record.sha)

      this.setBin(decompressData(record))

      this.blockSharing = true
      this.blockUpload = true
    } catch (error) {
      console.error(error)

      if (error?.response?.status === 403 && error?.response?.message?.indexOf('Requests exhausted') !== -1) {
        iziToast.error({
          title: 'Error',
          message: 'Sorry. The free database is exausted. :(',
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

    this.loadingBin = false
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
  left: -250px;
  bottom: 0;
  width: calc(100% + 250px);
  height: 0.8em;
  border-radius: 0;
  border: 0;
  z-index: 1;

  .progress-bar {
    background-color: var(--primary-color);
    animation-name: progress;
    animation-duration: 800ms;
    animation-iteration-count: infinite;
    animation-timing-function: linear;

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

@keyframes progress {
  from {
    transform: translateX(0);
  }

  to {
    transform: translateX(48px);
  }
}
</style>

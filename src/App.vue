<template>
  <div
    class="home"
    @drop.prevent="upload"
    @dragover.prevent="dragover"
    @dragleave.prevent="dragleave"
    :class="{ loading: loadingItems || loadingBin || sharing || exporting }"
  >
    <div class="progress" v-if="showProgressBar">
      <div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" style="width: 100%"></div>
    </div>

    <Logo :small="hasFiles || loadingBin" />

    <router-view></router-view>

    <Footer />

    <GitHubCorner />
  </div>
</template>

<script>
import { mapGetters, mapMutations, mapState, mapActions } from 'vuex'
import iziToast from 'izitoast'

import Footer from './components/Footer.vue'
import GitHubCorner from './components/GitHubCorner.vue'
import Logo from './components/Logo.vue'
import database from './services/database'
import Items from './services/items'
import { decompressData } from './utils'
import router from './router'

export default {
  name: 'App',
  components: {
    GitHubCorner,
    Footer,
    Logo,
  },
  computed: {
    ...mapState([
      'blockSharing',
      'blockUpload',
      'chestLogs',
      'exporting',
      'files',
      'filters',
      'hidePlayers',
      'initialized',
      'loadingBin',
      'loadingItems',
      'lootLogs',
      'sharing',
      'showPlayers',
    ]),
    ...mapGetters(['filteredPlayers', 'hasFiles']),
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
    ...mapMutations([
      'reset',
      'setBin',
      'setBlockSharing',
      'setBlockUpload',
      'setInitialized',
      'setLoadingBin',
      'setLoadingItems',
    ]),
    ...mapActions(['upload']),
    dragover() {
      if (!this.initialized || this.loadingBin || this.blockUpload) {
        return
      }

      document.body.classList.add('dragover')
    },
    dragleave() {
      document.body.classList.remove('dragover')
    },
    async loadItems(sha) {
      this.setInitialized(false)

      setTimeout(() => {
        if (!this.initialized) {
          this.setLoadingItems(true)
        }
      }, 2000)

      await Items.init(sha)

      this.setInitialized(true)
      this.setLoadingItems(false)
    },
    async loadBin(bin) {
      console.info('loading bin', bin)

      this.setLoadingBin(true)

      try {
        console.info('fetching bin', bin)

        const { record } = await database.read(bin)

        console.log('record', record)

        console.info('fetching items from sha', record.sha)

        await this.loadItems(record.sha)

        console.info('decompressing record')

        const data = decompressData(record)

        console.info('setting data', data)

        this.setBin(data)

        this.setLoadingBin(false)
        this.setBlockSharing(data.blockSharing)
        this.setBlockUpload(data.blockUpload)
      } catch (error) {
        console.error(error)

        await this.loadItems()

        this.setLoadingBin(false)

        if (error?.response?.status === 403 && error?.response?.message?.indexOf('Requests exhausted') !== -1) {
          iziToast.error({
            title: 'Error',
            message: 'Sorry. The free database is exausted. :(',
            progressBarColor: 'red',
            titleColor: 'red'
          })
        } else if (error?.response?.status === 422 && error?.response?.message?.indexOf('Invalid Record ID') !== -1) {
          iziToast.error({
            title: 'Error',
            message: 'List of items not found.',
            progressBarColor: 'red',
            titleColor: 'red'
          })
        } else if (error?.response?.status === 404 && error?.response?.message?.indexOf('Bin not found') !== -1) {
          iziToast.error({
            title: 'Error',
            message: 'List of items not found.',
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

        router.push('/')
      }
    }
  },
  async mounted() {
    if (this.$route.query.b) {
      return router.replace(`/${this.$route.query.b}`)
    }

    if (this.$route.params.bin) {
      return this.loadBin(this.$route.params.bin)
    }

    this.loadItems()
  },
  watch: {
    $route(to, from) {
      console.log('watch $route', { to,from })

      if (to.path === '/') {
        this.reset()

        return this.loadItems()
      }

      if (this.$route.query.b) {
        router.replace(`/${this.$route.query.b}`)
      }

      if (from.query.b && from.query.b === to.params.bin) {
        return this.loadBin(to.params.bin)
      }
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

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
  data() {
    return {
      loadingItems: false
    }
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
    ...mapMutations(['setBin', 'setInitialized', 'setLoadingBin', 'setBlockUpload', 'setBlockSharing', 'reset']),
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
      setTimeout(() => {
        if (!this.initialized) {
          this.loadingItems = true
        }
      }, 2000)

      await Items.init(sha)

      this.setInitialized(true)
      this.loadingItems = false
    },
    async loadBin(bin) {
      this.setLoadingBin(true)

      try {
        const { record } = await database.read(bin)

        await this.loadItems(record.sha)

        const data = decompressData(record)

        this.setBin(data)

        this.setBlockSharing(data.blockSharing)
        this.setBlockUpload(data.blockUpload)
      } catch (error) {
        const promise = this.loadItems()

        console.error(error)

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
        } else {
          iziToast.error({
            title: 'Error',
            message: error.message || 'Something went wrong. :(',
            progressBarColor: 'red',
            titleColor: 'red'
          })
        }

        await promise
      }

      this.setLoadingBin(false)
    }
  },
  async mounted() {
    window.$route = this.$route

    if (this.$route.query.b) {
      router.replace(`/${this.$route.query.b}`)
    }

    if (this.hasFiles || !database.valid) {
      return this.loadItems()
    }

    const bin = this.$route.params.bin

    if (bin == null) {
      return this.loadItems()
    }

    return this.loadBin(bin)

  },
  watch: {
    $route(to) {
      if (to.path === '/') {
        return this.reset()
      }

      if (to.params.bin != null) {
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

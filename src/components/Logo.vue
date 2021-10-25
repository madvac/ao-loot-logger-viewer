<template>
  <div>
    <router-link v-if="small" to="/">
      <img class="small" src="assets/logo.png" alt="Loot Logger Logo" @click="onClick" />
    </router-link>

    <img v-else src="assets/logo.png" alt="Loot Logger Logo" />
  </div>
</template>

<script>
import { mapMutations, mapState, mapGetters } from 'vuex'

import Items from '../services/items'

export default {
  name: 'Logo',
  props: {
    small: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    ...mapState(['initialized']),
    ...mapGetters(['hasFiles']),
    isClickable() {
      console.log(this.$route.path)

      return this.hasFiles || this.$route.path !== '/'
    }
  },
  methods: {
    ...mapMutations(['reset', 'setInitialized', 'setLoadingItems']),
    async onClick() {
      this.reset()

      this.setInitialized(false)

      setTimeout(() => {
        if (!this.initialized) {
          this.setLoadingItems(true)
        }
      }, 2000)

      await Items.init()

      this.setInitialized(true)
      this.setLoadingItems(false)
    }
  }
}
</script>

<style scoped lang="scss">
div {
  text-align: center;
}

img {
  margin-top: 5rem;
  width: 20%;
  max-width: 250px;
  min-width: 150px;
}

.clickable {
  cursor: pointer;
}

.small {
  margin-top: 0;
  position: fixed;
  min-width: 50px;
  left: 1rem;
  top: 1rem;
  width: 4rem;
}

@media screen and (max-width: 720px) {
  .small {
    display: none;
  }
}
</style>

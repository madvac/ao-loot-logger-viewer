<template>
  <div>
    <router-link to="/">
      <img :class="{ small: small }" src="assets/logo.png" alt="Loot Logger Logo" @click="reset" />
    </router-link>

    <!-- <img v-else :class="{ small: small }" src="assets/logo.png" alt="Loot Logger Logo" /> -->
  </div>
</template>

<script>
import { mapMutations, mapGetters } from 'vuex'

export default {
  name: 'Logo',
  props: {
    small: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    ...mapGetters(['hasFiles']),
    isClickable() {
      console.log(this.$route.path)

      return this.hasFiles || this.$route.path !== '/'
    }
  },
  methods: {
    ...mapMutations(['reset']),
    onClick() {
      this.reset()
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

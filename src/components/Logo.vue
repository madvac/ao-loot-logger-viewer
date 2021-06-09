<template>
  <div>
    <img :class="{ small: hasFiles }" src="assets/logo.png" alt="" srcset="" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  computed: {
    ...mapGetters(['hasFiles'])
  }
}
</script>

<style scoped lang="scss">
img {
  position: absolute;
  top: 3rem;
  left: calc(50% - 100px);
  width: 200px;
  transition: top 500ms ease-in-out, left 500ms ease-in-out,
    width 500ms ease-in-out;
}

.small {
  position: absolute;
  left: 12px;
  top: 12px;
  width: 50px;
}
</style>
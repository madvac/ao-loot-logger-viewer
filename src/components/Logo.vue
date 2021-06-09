<template>
  <div>
    <img
      :class="{ small: small }"
      src="assets/logo.png"
      alt="Loot Logger Logo"
      @click="() => $emit('click')"
    />
  </div>
</template>

<script>
export default {
  props: {
    small: {
      type: Boolean,
      default: false
    }
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
  cursor: pointer;
}

.small {
  position: fixed;
  left: 1rem;
  top: 2rem;
  width: 50px;
}
</style>
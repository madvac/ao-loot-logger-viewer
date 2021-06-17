<template>
  <div>
    <a href="/">
      <img :class="{ small: small }" src="assets/logo.png" alt="Loot Logger Logo" @click="() => $emit('click')" />
    </a>
  </div>
</template>

<script>
export default {
  name: 'Logo',
  props: {
    small: {
      type: Boolean,
      default: false
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
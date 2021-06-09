<template>
  <footer>
    <p>
      <a href="https://aolootlog.com/downloads" target="_blank">
        Download AO Loot Logger</a
      >
    </p>

    <p>
      <small>© {{ year }} Matheus Sampaio</small>
    </p>
  </footer>
</template>

<script>
export default {
  name: 'Footer',
  data() {
    return {
      year: new Date().getFullYear()
    }
  }
}
</script>

<style scoped lang="scss">
footer {
  text-align: center;
  margin-bottom: 16px;
}
</style>
<template>
  <footer>
    <a
      href="https://github.com/matheussampaio/ao-loot-logger/releases/latest/download/ao-loot-logger.exe"
    >
      Download AO Loot Logger</a
    >

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
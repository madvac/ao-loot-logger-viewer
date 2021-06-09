<template>
  <footer>© {{ year }} Matheus Sampaio</footer>
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
  margin-bottom: 16px;
}
</style>
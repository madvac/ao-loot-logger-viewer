<template>
  <div class="content-root">
    <div class="content" v-if="hasFiles || loadingBin">
      <Filters />

      <table id="loot-table" class="table table-bordered" v-if="sortedFilteredPlayers.length">
        <thead>
          <tr>
            <th>Name</th>
            <th>Items</th>
          </tr>
        </thead>
        <tbody>
          <PlayerLoot
            v-for="playerName in sortedFilteredPlayers"
            :key="playerName"
            :name="filteredPlayers[playerName].name"
            :alliance="filteredPlayers[playerName].alliance"
            :guild="filteredPlayers[playerName].guild"
            :died="filteredPlayers[playerName].died"
            :picked-up-items="filteredPlayers[playerName].pickedUpItems"
            :resolved-items="filters.resolved ? filteredPlayers[playerName].resolvedItems : {}"
            :lost-items="filters.lost ? filteredPlayers[playerName].lostItems : {}"
            :donated-items="filters.donated ? filteredPlayers[playerName].donatedItems : {}"
            />
        </tbody>
      </table>

      <div v-else-if="loadingBin" class="loading-bin">
        <p>Loading...</p>
      </div>

      <div v-else class="no-players">
        <p>This item list is empty.</p>
        <p>Update the filters or upload more files.</p>
      </div>

      <Upload @change="upload" popup :disabled="!initialized || loadingBin || blockUpload" />
    </div>

    <div class="content file-upload" v-if="!hasFiles && !loadingBin">
      <Upload @change="upload" :disabled="!initialized || loadingBin || blockUpload" />

      <a href="#faq">Read the FAQ</a>

      <FAQ />
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex'

import FAQ from '../components/FAQ.vue'
import Filters from '../components/Filters.vue'
import Upload from '../components/Upload.vue'
import PlayerLoot from '../components/PlayerLoot.vue'

export default {
  name: 'Home',
  components: {
    FAQ,
    PlayerLoot,
    Filters,
    Upload
  },
  computed: {
    ...mapState(['filters', 'initialized', 'loadingBin', 'blockUpload']),
    ...mapGetters(['sortedFilteredPlayers', 'filteredPlayers', 'hasFiles'])
  },
  methods: {
    ...mapActions(['upload'])
  }
}
</script>

<style lang="scss">
.content-root {
  align-items: flex-start;
  display: flex;
  flex: 1 0 auto;
  justify-content: center;
  width: 80%;
}

.content {
  flex: 1 0 auto;
  width: 100%;
  max-width: 1280px;
  margin-bottom: 32px;
  display: flex;
  flex-direction: column;
  align-items: center;

  .no-players {
    background-color: rgba(0, 0, 0, 0.2);
    padding: 2rem;
    text-align: center;
    width: 100%;

    p {
      margin: 0;
    }

    p + p {
      margin-top: 1rem;
    }
  }

  .loading-bin {
    align-items: center;
    background-color: rgba(0, 0, 0, 0.2);
    display: flex;
    justify-content: center;
    padding: 2rem;
    text-align: center;
    width: 100%;

    p {
      margin: 0;
    }
  }

  table {
    background-color: rgba(0, 0, 0, 0.25);
    border-color: transparent !important;
    border-radius: 5px;
    border-collapse: collapse;
    border-spacing: 0px;
    color: var(--font-color);

    thead {
      color: var(--primary-color);
    }

    tr:nth-child(2n + 2) {
      background-color: rgba(0, 0, 0, 0.1);
    }

    th {
      padding: 8px;
      text-align: center;
      min-width: 200px;
      vertical-align: middle;
    }
  }
}
</style>

<template>
  <div class="content-root">
    <div class="content" v-if="hasFiles">
      <Filters
        @share="onShare"
        @share-blocked="onShareBlocked"
        @export="onExport"
        :disabledShare="sharing || !hasFiles || blockSharing || !validDb"
        :disabledExport="exporting || !hasFiles"
        />

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
            :died="filteredPlayers[playerName].died"
            :picked-up-items="filteredPlayers[playerName].pickedUpItems"
            :resolved-items="filters.resolved ? filteredPlayers[playerName].resolvedItems : {}"
            :lost-items="filters.lost ? filteredPlayers[playerName].lostItems : {}"
            :donated-items="filters.donated ? filteredPlayers[playerName].donatedItems : {}"
            />
        </tbody>
      </table>

      <div v-else class="no-players">
        <p>No loot to display.</p>
        <p>Update the filters or upload more files.</p>
      </div>
    </div>

    <div class="content file-upload">
      <Upload @change="upload" :popup="hasFiles" :disabled="!initialized || loadingBin || blockUpload" />

      <a href="#faq" v-if="!hasFiles">Read the FAQ</a>

      <FAQ v-if="!hasFiles" />
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'

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
    Upload,
  },
  computed: {
    ...mapState(['initialized', 'loadingBin', 'blockUpload', 'hasFiles'])
  },
  methods: {
   ...mapActions([
     'upload'
    ]) 
  }
}
</script>

<style lang="scss">
.content-root {
  flex: 1 0 auto;
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
    width: 100%;
    text-align: center;
    padding-top: 1rem;
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

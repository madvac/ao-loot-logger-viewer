<template>
  <div class="container">
    <div class="controls">
      <div class="control" v-if="fileSaverSupport" title="Export missing items as CSV">
        <button @click="() => $emit('export')" :disabled="disabledExport">
          <svg aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
            <path
              fill="currentColor"
              d="M216 0h80c13.3 0 24 10.7 24 24v168h87.7c17.8 0 26.7 21.5 14.1 34.1L269.7 378.3c-7.5 7.5-19.8 7.5-27.3 0L90.1 226.1c-12.6-12.6-3.7-34.1 14.1-34.1H192V24c0-13.3 10.7-24 24-24zm296 376v112c0 13.3-10.7 24-24 24H24c-13.3 0-24-10.7-24-24V376c0-13.3 10.7-24 24-24h146.7l49 49c20.1 20.1 52.5 20.1 72.6 0l49-49H488c13.3 0 24 10.7 24 24zm-124 88c0-11-9-20-20-20s-20 9-20 20 9 20 20 20 20-9 20-20zm64 0c0-11-9-20-20-20s-20 9-20 20 9 20 20 20 20-9 20-20z"
            ></path>
          </svg>
        </button>
        <div class="control-name">Export</div>
      </div>
      <div class="control" title="Create a sharable link">
        <button @click="() => $emit('share')" :disabled="disabledShare">
          <svg aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
            <path
              fill="currentColor"
              d="M326.612 185.391c59.747 59.809 58.927 155.698.36 214.59-.11.12-.24.25-.36.37l-67.2 67.2c-59.27 59.27-155.699 59.262-214.96 0-59.27-59.26-59.27-155.7 0-214.96l37.106-37.106c9.84-9.84 26.786-3.3 27.294 10.606.648 17.722 3.826 35.527 9.69 52.721 1.986 5.822.567 12.262-3.783 16.612l-13.087 13.087c-28.026 28.026-28.905 73.66-1.155 101.96 28.024 28.579 74.086 28.749 102.325.51l67.2-67.19c28.191-28.191 28.073-73.757 0-101.83-3.701-3.694-7.429-6.564-10.341-8.569a16.037 16.037 0 0 1-6.947-12.606c-.396-10.567 3.348-21.456 11.698-29.806l21.054-21.055c5.521-5.521 14.182-6.199 20.584-1.731a152.482 152.482 0 0 1 20.522 17.197zM467.547 44.449c-59.261-59.262-155.69-59.27-214.96 0l-67.2 67.2c-.12.12-.25.25-.36.37-58.566 58.892-59.387 154.781.36 214.59a152.454 152.454 0 0 0 20.521 17.196c6.402 4.468 15.064 3.789 20.584-1.731l21.054-21.055c8.35-8.35 12.094-19.239 11.698-29.806a16.037 16.037 0 0 0-6.947-12.606c-2.912-2.005-6.64-4.875-10.341-8.569-28.073-28.073-28.191-73.639 0-101.83l67.2-67.19c28.239-28.239 74.3-28.069 102.325.51 27.75 28.3 26.872 73.934-1.155 101.96l-13.087 13.087c-4.35 4.35-5.769 10.79-3.783 16.612 5.864 17.194 9.042 34.999 9.69 52.721.509 13.906 17.454 20.446 27.294 10.606l37.106-37.106c59.271-59.259 59.271-155.699.001-214.959z"
            ></path>
          </svg>
        </button>
        <div class="control-name">Share</div>
      </div>
      <div class="control" title="Create a read-only sharable link">
        <button @click="() => $emit('share-blocked')" :disabled="disabledShare">
          <svg aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
            <path fill="currentColor" d="M400 224h-24v-72C376 68.2 307.8 0 224 0S72 68.2 72 152v72H48c-26.5 0-48 21.5-48 48v192c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V272c0-26.5-21.5-48-48-48zm-104 0H152v-72c0-39.7 32.3-72 72-72s72 32.3 72 72v72z">
            </path>
          </svg>
        </button>
        <div class="control-name">Share Read-Only</div>
      </div>
    </div>
    <div class="filters">
      <div v-for="(value, name) in filters" :key="name" class="filter">
        <button @click="() => toggleFilter(name)" :id="name">
          <svg
            v-if="filters[name]"
            aria-hidden="true"
            focusable="false"
            data-prefix="far"
            data-icon="eye"
            class="eye"
            role="img"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 576 512"
          >
            <path
              fill="currentColor"
              d="M288 144a110.94 110.94 0 0 0-31.24 5 55.4 55.4 0 0 1 7.24 27 56 56 0 0 1-56 56 55.4 55.4 0 0 1-27-7.24A111.71 111.71 0 1 0 288 144zm284.52 97.4C518.29 135.59 410.93 64 288 64S57.68 135.64 3.48 241.41a32.35 32.35 0 0 0 0 29.19C57.71 376.41 165.07 448 288 448s230.32-71.64 284.52-177.41a32.35 32.35 0 0 0 0-29.19zM288 400c-98.65 0-189.09-55-237.93-144C98.91 167 189.34 112 288 112s189.09 55 237.93 144C477.1 345 386.66 400 288 400z"
            ></path>
          </svg>
          <svg
            v-else
            aria-hidden="true"
            focusable="false"
            data-prefix="far"
            data-icon="eye-slash"
            class="eye-slash"
            role="img"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 640 512"
          >
            <path
              fill="currentColor"
              d="M634 471L36 3.51A16 16 0 0 0 13.51 6l-10 12.49A16 16 0 0 0 6 41l598 467.49a16 16 0 0 0 22.49-2.49l10-12.49A16 16 0 0 0 634 471zM296.79 146.47l134.79 105.38C429.36 191.91 380.48 144 320 144a112.26 112.26 0 0 0-23.21 2.47zm46.42 219.07L208.42 260.16C210.65 320.09 259.53 368 320 368a113 113 0 0 0 23.21-2.46zM320 112c98.65 0 189.09 55 237.93 144a285.53 285.53 0 0 1-44 60.2l37.74 29.5a333.7 333.7 0 0 0 52.9-75.11 32.35 32.35 0 0 0 0-29.19C550.29 135.59 442.93 64 320 64c-36.7 0-71.71 7-104.63 18.81l46.41 36.29c18.94-4.3 38.34-7.1 58.22-7.1zm0 288c-98.65 0-189.08-55-237.93-144a285.47 285.47 0 0 1 44.05-60.19l-37.74-29.5a333.6 333.6 0 0 0-52.89 75.1 32.35 32.35 0 0 0 0 29.19C89.72 376.41 197.08 448 320 448c36.7 0 71.71-7.05 104.63-18.81l-46.41-36.28C359.28 397.2 339.89 400 320 400z"
            ></path>
          </svg>
        </button>
        <div class="filter-name">{{ name }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex'

export default {
  name: 'Filters',
  props: {
    disabledShare: {
      type: Boolean,
      default: false
    },
    disabledExport: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    ...mapState(['filters']),
    fileSaverSupport() {
      try {
        return !!new Blob()
      } catch (e) {
        return false
      }
    }
  },
  methods: {
    ...mapMutations(['toggleFilter'])
  }
}
</script>

<style scoped lang="scss">
.container {
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-bottom: 3rem;
  margin-top: 1rem;
}

.controls {
  display: grid;
  grid-template-columns: 80px 80px 120px;
  margin-bottom: 1em;
}

.control {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.control-name {
  text-transform: capitalize;
  font-size: 0.8em;
}

.filters {
  display: grid;
  grid-gap: 1em;
  grid-template-columns: repeat(auto-fit, minmax(40px, 1fr));
  width: 100%;
  text-align: center;
}

.form-check-inline {
  margin-right: 1.5em;
}

.filter {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.filter-name {
  text-transform: capitalize;
  font-size: 0.8em;
}

svg {
  width: 16px;
  margin-left: 4px;
  margin-bottom: 4px;
  color: var(--primary-color);
}

button[disabled] svg {
  color: #808080;
  cursor: not-allowed;
}

svg.eye-slash {
  color: #808080;
}

svg.download {
  color: #e43333;
}

svg:hover {
  color: var(--secondary-color);
}

button {
  border: none;
  background: none;
  margin-right: 4px;
}
</style>

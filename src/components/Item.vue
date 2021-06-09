<template>
  <figure
    class="item"
    :class="{
      donated: type === 'donation',
      lost: type === 'lost',
      resolved: type === 'resolved',
      loaded: loaded
    }"
  >
    <img :src="url" :title="title" loading="lazy" @load="onLoad" />
    <code class="amount">{{ amount }}</code>
  </figure>
</template>

<script>
import itemsIdToName from '../utils/items-id-to-name.json'
import { dateToStr } from '../utils/date'

export default {
  name: 'Item',
  data() {
    return {
      loaded: false
    }
  },
  props: {
    id: {
      type: String,
      required: true
    },
    history: {
      type: Array,
      required: true
    },
    type: {
      type: String,
      default: () => 'pickedup'
    },
    amount: {
      type: Number,
      default: () => 1
    }
  },
  computed: {
    url() {
      return `https://render.albiononline.com/v1/item/${this.id}.png?count=1&quality=1&size=217`
    },
    title() {
      let strs = []

      if (this.type === 'donation') {
        strs = this.history.map(
          (e) => `${e.amount}x donated at ${dateToStr(e.donatedAt)}`
        )
      } else if (this.type === 'lost') {
        strs = this.history.map(
          (e) =>
            `${e.amount}x lost to ${e.lootedBy} at ${dateToStr(e.lootedAt)}`
        )
      } else if (this.type === 'resolved') {
        strs = this.history.map(
          (e) => `${e.amount}x ${e.str} at ${dateToStr(e.at)}`
        )
      } else {
        strs = this.history.map(
          (e) =>
            `${e.amount}x looted from ${e.lootedFrom} at ${dateToStr(
              e.lootedAt
            )}`
        )
      }

      return [`${itemsIdToName[this.id]} - ${this.id}`, '', ...strs].join('\n')
    }
  },
  methods: {
    onLoad() {
      this.loaded = true
    }
  }
}
</script>

<style scoped lang="scss">
figure {
  margin-bottom: 0;
  width: 4rem;
  height: 4rem;
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 5px;
  transition: background-color 300ms ease-out;

  img,
  .amount {
    opacity: 0;
    transition: opacity 300ms ease-out;
  }
}

figure.loaded {
  background-color: transparent;

  img,
  .amount {
    opacity: 1;
  }
}

.item {
  position: relative;
}

img {
  width: 4rem;
}

.amount {
  color: white;
  font-size: 0.7em;
  position: absolute;
  left: calc(3rem - 10px);
  top: calc(3rem - 9px);
  width: 20px;
  text-align: center;
}

.donated {
  filter: sepia(100%) saturate(200%) hue-rotate(90deg);
}

.lost {
  filter: sepia(100%) saturate(200%) hue-rotate(-60deg);
}

.resolved {
  filter: grayscale(100%);
}
</style>

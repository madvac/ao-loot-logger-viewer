<template>
  <figure
    v-lazyload
    class="item"
    :class="{
      donated: type === 'donation',
      lost: type === 'lost',
      resolved: type === 'resolved'
    }"
  >
    <img :data-url="url" :title="title" />
    <div class="amount">{{ amount }}</div>
  </figure>
</template>

<script>
import itemsIdToName from '../utils/items-id-to-name.json'
import { dateToStr } from '../utils/date'

export default {
  name: 'Item',
  data() {
    return {
      publicPath: process.env.BASE_URL
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
  }
}
</script>

<style scoped lang="scss">
figure {
  margin-bottom: 0;
}

.item {
  // display: grid;
  // grid-template-columns: 1fr;
  // grid-template-rows: 1fr auto;
  // width: 4rem;
  // height: 4rem;
  position: relative;
}

img {
  width: 4rem;
  // grid-column: 1;
  // grid-row: 1;
}

.amount {
  display: none;
}

.loaded {
  .amount {
    display: block;
    font-size: 0.8em;
    color: white;
    // align-self: end;
    // justify-self: end;
    // grid-column: 1;
    // grid-row: 1;
    // margin-right: 9px;
    // margin-bottom: 10px;
    font-family: monospaced;
    position: absolute;
    left: calc(3rem - 3px);
    top: calc(3rem - 10px);
  }
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

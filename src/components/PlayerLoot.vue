<template>
  <tr>
    <td class="player-name" :class="{ died: died }">
      <div :title="died ? `${name} died.` : ''">
        {{ name }}
      </div>
    </td>
    <transition-group name="list" class="items" tag="td">
      <Item
        v-for="item in items"
        :key="item.key"
        :id="item.itemId"
        :type="item.type"
        :amount="item.amount"
        :history="item.history"
      />
    </transition-group>
  </tr>
</template>

<script>
import Item from './Item.vue'

export default {
  name: 'PlayerLoot',
  components: {
    Item
  },
  props: {
    name: {
      type: String,
      required: true
    },
    pickedUpItems: {
      type: Object,
      required: true
    },
    resolvedItems: {
      type: Object,
      required: true
    },
    lostItems: {
      type: Object,
      required: true
    },
    donatedItems: {
      type: Object,
      required: true
    },
    died: {
      type: Boolean,
      default: () => false
    }
  },
  computed: {
    items() {
      const items = []

      for (const itemId in this.pickedUpItems) {
        const item = this.pickedUpItems[itemId]

        items.push({
          key: `pickedup-${itemId}`,
          itemId,
          type: 'pickedup',
          amount: item.amount,
          history: item.history
        })
      }

      for (const itemId in this.resolvedItems) {
        const item = this.resolvedItems[itemId]

        items.push({
          key: `resolved-${itemId}`,
          itemId,
          type: 'resolved',
          amount: item.amount,
          history: item.history
        })
      }

      for (const itemId in this.lostItems) {
        const item = this.lostItems[itemId]

        items.push({
          key: `lost-${itemId}`,
          itemId,
          type: 'lost',
          amount: item.amount,
          history: item.history
        })
      }

      for (const itemId in this.donatedItems) {
        const item = this.donatedItems[itemId]

        items.push({
          key: `donation-${itemId}`,
          itemId,
          type: 'donation',
          amount: item.amount,
          history: item.history
        })
      }

      return items
    }
  }
}
</script>

<style scoped lang="scss">
.player-name {
  text-align: center;
  width: 200px;
  vertical-align: middle;
  font-weight: 600;
  cursor: default;
}

.died {
  color: #cc0000;
}

.items {
  display: grid;
  grid-gap: 0.2rem;
  grid-template-columns: repeat(auto-fit, 4rem);
}

.list-enter-active,
.list-leave-active {
  transition: opacity 800ms ease-in-out, transform 800ms ease-in-out;
}

.list-item {
  transition: opacity 800ms ease-in-out, transform 800ms ease-in-out;
}

.list-enter,
.list-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

.list-leave-active {
  position: absolute;
}

.list-move {
  transition: transform 800ms;
}
</style>

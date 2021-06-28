<template>
  <tr>
    <td class="player-name" :class="{ died: died }">
      <div :title="died ? `${name} died.` : ''">
        {{ name }}

        <svg
          aria-hidden="true"
          focusable="false"
          role="img"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 448 512"
          @click="() => hidePlayer(name)"
        >
          <path
            fill="currentColor"
            d="M32 464a48 48 0 0 0 48 48h288a48 48 0 0 0 48-48V128H32zm272-256a16 16 0 0 1 32 0v224a16 16 0 0 1-32 0zm-96 0a16 16 0 0 1 32 0v224a16 16 0 0 1-32 0zm-96 0a16 16 0 0 1 32 0v224a16 16 0 0 1-32 0zM432 32H312l-9.4-18.7A24 24 0 0 0 281.1 0H166.8a23.72 23.72 0 0 0-21.4 13.3L136 32H16A16 16 0 0 0 0 48v32a16 16 0 0 0 16 16h416a16 16 0 0 0 16-16V48a16 16 0 0 0-16-16z"
          ></path>
        </svg>
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
        :subcategory="item.history[0].subcategory"
        :category="item.history[0].category"
      />
    </transition-group>
  </tr>
</template>

<script>
import { mapMutations } from 'vuex'
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
          itemId,
          key: `pickedup-${itemId}`,
          type: 'pickedup',
          ...item
        })
      }

      for (const itemId in this.resolvedItems) {
        const item = this.resolvedItems[itemId]

        items.push({
          itemId,
          key: `resolved-${itemId}`,
          type: 'resolved',
          ...item
        })
      }

      for (const itemId in this.lostItems) {
        const item = this.lostItems[itemId]

        items.push({
          itemId,
          key: `lost-${itemId}`,
          type: 'lost',
          ...item
        })
      }

      for (const itemId in this.donatedItems) {
        const item = this.donatedItems[itemId]

        items.push({
          itemId,
          key: `donation-${itemId}`,
          type: 'donation',
          ...item
        })
      }

      return items
    }
  },
  methods: {
    ...mapMutations(['hidePlayer'])
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
  position: relative;

  svg {
    position: absolute;
    visibility: hidden;
    opacity: 0;
    transition: opacity 300ms ease-in-out, color 300ms ease-in-out;
    width: 0.8rem;
    top: 1rem;
    left: 1rem;
    cursor: pointer;

    &:hover {
      color: var(--secondary-color);
    }
  }

  &:hover svg {
    visibility: visible;
    opacity: 1;
  }
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

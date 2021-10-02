export default function shouldFilterItem(item, filters) {
  // Hide by tier.
  if (item.tier) {
    if (item.tier === 1 && !filters.others) {
      return false
    }

    if (item.tier === 2 && !filters.others) {
      return false
    }

    if (item.tier === 3 && !filters.others) {
      return false
    }

    if (item.tier === 4 && !filters.t4) {
      return false
    }

    if (item.tier === 5 && !filters.t5) {
      return false
    }

    if (item.tier === 6 && !filters.t6) {
      return false
    }

    if (item.tier === 7 && !filters.t7) {
      return false
    }

    if (item.tier === 8 && !filters.t8) {
      return false
    }
  }

  // Hide bags.
  if (!filters.bag && item.subcategory === 'bag') {
    return false
  }

  // Hide cape.
  if (!filters.cape && item.subcategory === 'cape') {
    return false
  }

  // Hide food.
  if (
    !filters.food &&
    item.category === 'consumables' &&
    (item.subcategory === 'cooked' || item.subcategory === 'fish')
  ) {
    return false
  }

  // Hide potions.
  if (!filters.potion && item.category === 'consumables' && item.subcategory === 'potion') {
    return false
  }

  // Hide mounts, but not battle mounts.
  if (!filters.mount && item.category === 'mounts' && item.subcategory !== 'battle_mount') {
    return false
  }

  // Hide trash.
  if (!filters.trash && item.category === 'other' && item.subcategory === 'trash') {
    return false
  }

  if (!filters.others) {
    // let trash be handle by another filter
    if (item.category === 'other' && item.subcategory !== 'trash') {
      return false
    }

    if (item.category === 'skillbooks') {
      return false
    }

    if (item.category === 'furniture') {
      return false
    }

    if (item.category === 'artefacts') {
      return false
    }

    if (item.category === 'materials') {
      return false
    }

    // Hide consumables but let potion and food be handle by another filter.
    if (
      item.category === 'consumables' &&
      item.subcategory !== 'potion' &&
      item.subcategory !== 'cooked' &&
      item.subcategory !== 'fish'
    ) {
      return false
    }

    if (item.category === 'farmables') {
      return false
    }

    if (item.category === 'products') {
      return false
    }

    if (item.category === 'tools') {
      return false
    }

    if (item.category === 'luxurygoods') {
      return false
    }

    if (item.category === 'resources') {
      return false
    }

    // Some vanity items have the same category and subcategory from the slot type.
    if (item.itemId.match(/_VANITY_/)) {
      return false
    }

    if (item.category === 'token') {
      return false
    }
  }

  return true
}

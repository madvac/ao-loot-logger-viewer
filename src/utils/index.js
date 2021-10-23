import moment from 'moment'

import Items from '../services/items'

export function bytesToSize(bytes) {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']

  if (bytes === 0) {
    return 'n/a'
  }

  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10)

  if (i === 0) {
    return `${bytes} ${sizes[i]})`
  }

  return `${(bytes / 1024 ** i).toFixed(1)} ${sizes[i]}`
}

export function getJSONSizeInKBytes(json) {
  const bytes = new TextEncoder().encode(JSON.stringify(json)).length
  const kbytes = bytes / 1024

  return Math.floor(kbytes)
}

export function copyToClipboard(str) {
  const copyTextarea = document.createElement('textarea')

  copyTextarea.style.position = 'fixed'
  copyTextarea.style.opacity = '0'
  copyTextarea.textContent = str

  document.body.appendChild(copyTextarea)
  copyTextarea.select()
  document.execCommand('copy')
  document.body.removeChild(copyTextarea)
}

export function compressData(data) {
  const compressed = {
    version: 3,
    sha: Items.sha,
    filters: Object.keys(data.filters)
      .filter(key => data.filters[key])
      .join(';'),
    files: Object.keys(data.files).join(';'),
    showPlayers: {},
    hidePlayers: Object.keys(data.hidePlayers).join(';'),
    chestLogs: [],
    lootLogs: []
  }

  for (const playerName of data.showPlayers) {
    const filename = data.showPlayers[playerName]

    if (compressed.showPlayers[filename] == null) {
      compressed.showPlayers[filename] = []
    }

    compressed.showPlayers[filename].push(playerName)
  }

  for (const filename in compressed.showPlayers) {
    compressed.showPlayers[filename] = compressed.showPlayers[filename].join(';')
  }

  for (const log of data.lootLogs) {
    // exclude trash from logs
    if (log.itemId.indexOf('TRASH') !== -1) {
      continue
    }

    // if we're filtering players (the user uploaded a player list)
    // we only export the log if it's looted by or looted from a player in the show list
    if (
      Object.keys(data.showPlayers).length &&
      !data.showPlayers[log.lootedBy.toLowerCase()] &&
      !data.showPlayers[log.lootedFrom.toLowerCase()]
    ) {
      continue
    }

    // if both players are hidden, we can ignore this log
    if (data.hidePlayers[log.lootedBy.toLowerCase()] && data.hidePlayers[log.lootedFrom.toLowerCase()]) {
      continue
    }

    const info = Items.getInfoFromId(log.itemId)

    compressed.lootLogs.push([log.filename, log.lootedAt.unix(), log.lootedBy, info.index, log.amount, log.lootedFrom].join(';'))
  }

  for (const log of data.chestLogs) {
    // if we're filtering players (the user uploaded a player list)
    // we only export the log if it's donated by a player in the show list
    if (Object.keys(data.showPlayers).length && !data.showPlayers[log.donatedBy.toLowerCase()]) {
      continue
    }

    // if the player is hidden, we can ignore the donation
    if (data.hidePlayers[log.donatedBy.toLowerCase()]) {
      continue
    }

    const info = Items.getInfoFromId(log.itemId)

    compressed.chestLogs.push([log.filename, log.donatedAt.unix(), log.donatedBy, info.index, log.amount].join(';'))
  }

  return compressed
}

export function decompressData(data) {
  if (!data.version) {
    return data
  }

  const decompressed = {
    files: {},
    showPlayers: {},
    hidePlayers: {},
    chestLogs: [],
    lootLogs: []
  }

  if (data.filters != null) {
    decompressed.filters = {}

    for (const filter of data.filters.split(';')) {
      decompressed.filters[filter] = true
    }
  }

  if (data.version <= 1) {
    for (const file in data.lootLogs) {
      decompressed.files[file] = true
    }

    for (const file in data.chestLogs) {
      decompressed.files[file] = true
    }
  } else {
    for (const file of data.files.split(';')) {
      decompressed.files[file] = true
    }
  }

  if (data.version <= 2) {
    for (const playerName of data.showPlayers.split(';')) {
      decompressed.showPlayers[playerName] = true
    }
  } else {
    for (const filename of data.showPlayers) {
      for (const playerName of data.showPlayers[filename]) {
        decompressed.showPlayers[playerName] = filename
      }
    }
  }

  for (const playerName of data.hidePlayers.split(';')) {
    decompressed.hidePlayers[playerName] = true
  }

  if (data.version <= 1) {
    decompressed.lootLogs = decompressLootLogsDatav1(data.lootLogs)
  } else if (data.version <= 2) {
    decompressed.lootLogs = decompressLootLogsDatav2(data.lootLogs)
  } else {
    decompressed.lootLogs = decompressLootLogsData(data.lootLogs)
  }

  if (data.version <= 1) {
    decompressed.chestLogs = decompressChestLogsDatav1(data.chestLogs)
  } else if (data.version <= 2) {
    decompressed.chestLogs = decompressChestLogsDatav2(data.chestLogs)
  } else {
    decompressed.chestLogs = decompressChestLogsData(data.chestLogs)
  }

  return decompressed
}

function decompressLootLogsDatav1(lootLogs) {
  const decompressedLootLogs = []

  for (const file in lootLogs) {
    for (const log of lootLogs[file]) {
      const [lootedAtUnix, lootedBy, itemIndex, amount, lootedFrom] = log.split(';')

      const info = Items.getInfoFromIndex(itemIndex)

      decompressedLootLogs.push({
        lootedAt: moment.unix(lootedAtUnix),
        lootedBy,
        itemId: info.id,
        amount: parseInt(amount, 10),
        lootedFrom,
        category: info.category,
        subcategory: info.subcategory,
        tier: info.tier
      })
    }
  }

  return decompressedLootLogs
}

function decompressLootLogsDatav2(lootLogs) {
  const decompressedLootLogs = []

  for (const log of lootLogs) {
    const [lootedAtUnix, lootedBy, itemIndex, amount, lootedFrom] = log.split(';')

    const info = Items.getInfoFromIndex(itemIndex)

    decompressedLootLogs.push({
      lootedAt: moment.unix(lootedAtUnix),
      lootedBy,
      itemId: info.id,
      amount: parseInt(amount, 10),
      lootedFrom,
      category: info.category,
      subcategory: info.subcategory,
      tier: info.tier
    })
  }

  return decompressedLootLogs
}

function decompressLootLogsData(lootLogs) {
  const decompressedLootLogs = []

  for (const log of lootLogs) {
    const [filename, lootedAtUnix, lootedBy, itemIndex, amount, lootedFrom] = log.split(';')

    const info = Items.getInfoFromIndex(itemIndex)

    decompressedLootLogs.push({
      filename,
      lootedAt: moment.unix(lootedAtUnix),
      lootedBy,
      itemId: info.id,
      amount: parseInt(amount, 10),
      lootedFrom,
      category: info.category,
      subcategory: info.subcategory,
      tier: info.tier
    })
  }

  return decompressedLootLogs
}

function decompressChestLogsDatav1(chestLogs) {
  const decompressedChestLogs = []

  for (const file in chestLogs) {
    for (const log of chestLogs[file]) {
      const [donatedAtUnix, donatedBy, itemIndex, amount] = log.split(';')

      const info = Items.getInfoFromIndex(itemIndex)

      decompressedChestLogs.push({
        donatedAt: moment.unix(donatedAtUnix),
        donatedBy,
        itemId: info.id,
        amount: parseInt(amount, 10),
        category: info.category,
        subcategory: info.subcategory,
        tier: info.tier
      })
    }
  }

  return decompressedChestLogs
}

function decompressChestLogsDatav2(chestLogs) {
  const decompressedChestLogs = []

  for (const log of chestLogs) {
    const [donatedAtUnix, donatedBy, itemIndex, amount] = log.split(';')

    const info = Items.getInfoFromIndex(itemIndex)

    decompressedChestLogs.push({
      donatedAt: moment.unix(donatedAtUnix),
      donatedBy,
      itemId: info.id,
      amount: parseInt(amount, 10),
      category: info.category,
      subcategory: info.subcategory,
      tier: info.tier
    })
  }

  return decompressedChestLogs
}

function decompressChestLogsData(chestLogs) {
  const decompressedChestLogs = []

  for (const log of chestLogs) {
    const [filename, donatedAtUnix, donatedBy, itemIndex, amount] = log.split(';')

    const info = Items.getInfoFromIndex(itemIndex)

    decompressedChestLogs.push({
      filename,
      donatedAt: moment.unix(donatedAtUnix),
      donatedBy,
      itemId: info.id,
      amount: parseInt(amount, 10),
      category: info.category,
      subcategory: info.subcategory,
      tier: info.tier
    })
  }

  return decompressedChestLogs
}

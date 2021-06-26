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
    version: 1,
    sha: Items.sha,
    showPlayers: Object.keys(data.showPlayers).join(';'),
    hidePlayers: Object.keys(data.hidePlayers).join(';'),
    chestLogs: {},
    lootLogs: {}
  }

  for (const file in data.lootLogs) {
    const logs = []

    for (const log of data.lootLogs[file]) {
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

      logs.push([log.lootedAt.unix(), log.lootedBy, info.index, log.amount, log.lootedFrom].join(';'))
    }

    compressed.lootLogs[file] = logs
  }

  for (const file in data.chestLogs) {
    const logs = []

    for (const log of data.chestLogs[file]) {
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

      logs.push([log.donatedAt.unix(), log.donatedBy, info.index, log.amount].join(';'))
    }

    compressed.chestLogs[file] = logs
  }

  return compressed
}

export function decompressData(data) {
  if (!data.version) {
    return data
  }

  const decompressed = {
    showPlayers: {},
    hidePlayers: {},
    chestLogs: {},
    lootLogs: {}
  }

  for (const player of data.showPlayers.split(';')) {
    decompressed.showPlayers[player] = true
  }

  for (const player of data.hidePlayers.split(';')) {
    decompressed.hidePlayers[player] = true
  }

  for (const file in data.lootLogs) {
    const logs = []

    for (const log of data.lootLogs[file]) {
      const [lootedAtUnix, lootedBy, itemIndex, amount, lootedFrom] = log.split(';')

      const info = Items.getInfoFromIndex(itemIndex)

      logs.push({
        lootedAt: moment.unix(lootedAtUnix).toISOString(),
        lootedBy,
        itemId: info.id,
        amount: parseInt(amount, 10),
        lootedFrom,
        category: info.category,
        subcategory: info.subcategory,
        tier: info.tier
      })
    }

    decompressed.lootLogs[file] = logs
  }

  for (const file in data.chestLogs) {
    const logs = []

    for (const log of data.chestLogs[file]) {
      const [donatedAtUnix, donatedBy, itemIndex, amount] = log.split(';')

      const info = Items.getInfoFromIndex(itemIndex)

      logs.push({
        donatedAt: moment.unix(donatedAtUnix).toISOString(),
        donatedBy,
        itemId: info.id,
        amount: parseInt(amount, 10),
        category: info.category,
        subcategory: info.subcategory,
        tier: info.tier
      })
    }

    decompressed.chestLogs[file] = logs
  }

  return decompressed
}

const guildMemberLogRe = /^(("\d*"\t"(?<userName1>.*)"\t".*"\t"-?\d*")|(?<userName2>\w+)|(\d*,(?<userName3>.*),.*,-?\d*))$/gm
const lootLogRe = /^(?<lootedAt>.*);(?<lootedBy>\w*);(?<itemId>[\w@]+);(?<amount>\d*);(?<lootedFrom>\w*?)(;(?<itemName>.*))?$/gm
const aoLootLogRe = /^"(?<lootedAt>.*)","(?<lootedBy>\w*?)","(?<guildName>.*)","(?<item>.*)","(?<itemName>.*) \((?<itemId>[\w@]+)\)","(?<amount>.*)x .+","(?<lootedFrom>\w*?)"/gm
const chestLogRe = /^"(?<donatedAt>.*)"\t"(?<donatedBy>.*)"\t"(?<itemName>.*)"\t"(?<itemEnchant>\d*)"\t".*"\t"(?<amount>-?\d*)"$/gm
const chestLogCsvRe = /^(?<donatedAt>.*),(?<donatedBy>.*),(?<itemName>.*),(?<itemEnchant>\d),\d,(?<amount>-?\d*)$/gm
const chestLogSsvRe = /^(?<donatedAt>.*);(?<donatedBy>.*);(?<itemName>.*);(?<itemEnchant>\d);\d;(?<amount>-?\d*)$/gm

export default {
  guildMemberLogRe,
  lootLogRe,
  aoLootLogRe,
  chestLogRe,
  chestLogCsvRe,
  chestLogSsvRe
}

const guildMemberLogRe = /^(("\d*"\t"(?<userName1>.*)"\t".*"\t"-?\d*")|(?<userName2>\w+)|(\d*,(?<userName3>.*),.*,-?\d*))$/gm
const lootLogRe = /^(?<lootedAt>[^;]*);(?<lootedBy>\w*);(?<itemId>[\w@]+);(?<amount>\d*);(?<lootedFrom>\w*?)(;(?<itemName>.*))?$/gm
const v2LootLogRe =
  /^(?<lootedAt>[^;]*);(?<lootedByAlliance>.*);(?<lootedByGuild>.*);(?<lootedBy>\w*);(?<itemId>[\w@]+);(?<itemName>.*);(?<amount>\d*);(?<lootedFromAlliance>.*);(?<lootedFromGuild>.*);(?<lootedFrom>.*)$/gm
const aoLootLogRe = /^"(?<lootedAt>[^,]*)","(?<lootedBy>\w*?)","(?<guildName>.*)","(?<item>.*)","(?<itemName>.*) \((?<itemId>[\w@]+)\)","(?<amount>.*)x .+","(?<lootedFrom>\w*?)"/gm
const chestLogRe = /^"(?<donatedAt>.*?)"\s"(?<donatedBy>[\w\d]*)"\s"(?<itemName>.*)"\s"(?<itemEnchant>\d*)"\s"\d*"\s"(?<amount>-?\d*)"$/gm
const chestLogCsvRe = /^(?<donatedAt>.*),(?<donatedBy>.*),(?<itemName>.*),(?<itemEnchant>\d),\d,(?<amount>-?\d*)$/gm
const chestLogSsvRe = /^(?<donatedAt>.*);(?<donatedBy>.*);(?<itemName>.*);(?<itemEnchant>\d);\d;(?<amount>-?\d*)$/gm

export default {
  guildMemberLogRe,
  lootLogRe,
  aoLootLogRe,
  chestLogRe,
  chestLogCsvRe,
  chestLogSsvRe,
  v2LootLogRe
}

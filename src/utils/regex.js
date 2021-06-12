const guildMemberLogRe = /^("\d*"\t"(?<userName1>.*)"\t".*"\t"-?\d*")|(^(?<userName2>\w+)$)/gm
const lootLogRe = /^(?<lootedAt>.*);(?<lootedBy>\w*);(?<itemId>.*);(?<amount>\d*);(?<lootedFrom>\w*?)(;(?<itemName>.*))?$/gm
const aoLootLogRe = /^"(?<lootedAt>.*)","(?<lootedBy>\w*?)","(?<guildName>.*)","(?<item>.*)","(?<itemName>.*) \((?<itemId>.*)\)","(?<amount>.*)x .+","(?<lootedFrom>\w*?)"/gm
const chestLogRe = /^"(?<donatedAt>.*)"\t"(?<donatedBy>.*)"\t"(?<itemName>.*)"\t"(?<itemEnchant>\d*)"\t".*"\t"(?<amount>-?\d*)"$/gm

export default {
  guildMemberLogRe,
  lootLogRe,
  aoLootLogRe,
  chestLogRe
}

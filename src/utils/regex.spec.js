import regex from './regex'

describe('Regex', () => {
  describe('Loot Logs Regex', () => {
    it('should match with AO Loot Logger output style', () => {
      const lines = [
        `"12.6.2021 17.40.50","matheussampaio1","Guild Name 1","","Adept's Carrioncaller (T4_2H_HALBERD_MORGANA)","1x               0                          0             4,598             4,497             0             0","AnotherPlayer"`,
        `"12.6.2021 17.40.50","matheussampaio2","Guild Name 2","","Journeyman's Riding Horse (T3_MOUNT_HORSE)","1x               10,399                          10,748             11,677             10,939             10,649             11,275","AnotherPlayer"`
      ].join('\n')
      const results = [...lines.matchAll(regex.aoLootLogRe)]

      expect(results.length).toBe(2)

      const result = results[0]

      expect(result).not.toBeNull()

      expect(result.groups.lootedAt).toBe('12.6.2021 17.40.50')
      expect(result.groups.lootedBy).toBe('matheussampaio1')
      expect(result.groups.itemId).toBe('T4_2H_HALBERD_MORGANA')
      expect(result.groups.amount).toBe('1')
      expect(result.groups.lootedFrom).toBe('AnotherPlayer')
    })

    it('should NOT match with MS Loot Logger output style', () => {
      const lines = [
        `2021-06-07T22:25:16.432Z;matheussampaio1;T8_CAPEITEM_FW_BRIDGEWATCH;1;matheussampaio2;Elder's Bridgewatch Cape`,
        `2021-06-07T22:25:16.432Z;matheussampaio1;T8_CAPEITEM_FW_BRIDGEWATCH;1;matheussampaio2;Elder's Bridgewatch Cape`
      ].join('\n')

      const results = [...lines.matchAll(regex.aoLootLogRe)]

      expect(results.length).toBe(0)
    })

    it('should NOT match with guilds member list', () => {
      const line = `matheussampaio`
      const results = [...line.matchAll(regex.aoLootLogRe)]

      expect(results.length).toBe(0)
    })

    it('should NOT match with guild logs as guilds member list', () => {
      const line = `"1"	"matheussampaio"	""	"55738"`
      const results = [...line.matchAll(regex.aoLootLogRe)]

      expect(results.length).toBe(0)
    })

    it('should NOT match with chest logs', () => {
      const line = `"06/10/2021 04:04:42"	"matheussampaio"	"Master's Relic"	"0"	"1"	"1"`
      const results = [...line.matchAll(regex.aoLootLogRe)]

      expect(results.length).toBe(0)
    })

    it('should NOT match with comma separated chest logs', () => {
      const line = `06/15/2021 19:52:26,matheussampaio,Adept's Martlock Cape,2,3,1`
      const results = [...line.matchAll(regex.aoLootLogRe)]

      expect(results.length).toBe(0)
    })

    it('should NOT match with semicolon separated  chest logs', () => {
      const line = `06/23/2021 18:33:52;MLGBrax;Grandmaster's Rune;0;1;1`
      const results = [...line.matchAll(regex.aoLootLogRe)]

      expect(results.length).toBe(0)
    })
  })

  describe('AO Loot Logs Regex', () => {
    it('should match with Loot Logger output style', () => {
      const lines = [
        `5/7/2021 3:00:02;matheussampaio1;T7_POTION_STONESKIN;200;matheussampaio2`,
        `5/7/2021 3:00:02;matheussampaio1;T7_POTION_STONESKIN;200;matheussampaio2`
      ].join('\n')
      const results = [...lines.matchAll(regex.lootLogRe)]

      expect(results.length).toBe(2)

      const result = results[0]

      expect(result).not.toBeNull()

      expect(result.groups.lootedAt).toBe('5/7/2021 3:00:02')
      expect(result.groups.lootedBy).toBe('matheussampaio1')
      expect(result.groups.itemId).toBe('T7_POTION_STONESKIN')
      expect(result.groups.amount).toBe('200')
      expect(result.groups.lootedFrom).toBe('matheussampaio2')
      expect(result.groups.itemName).toBeUndefined()
    })

    it('should match with MS Loot Logger output style', () => {
      const lines = [
        `2021-06-07T22:25:16.432Z;matheussampaio1;T8_CAPEITEM_FW_BRIDGEWATCH;1;matheussampaio2;Elder's Bridgewatch Cape`,
        `2021-06-07T22:25:16.432Z;matheussampaio1;T8_CAPEITEM_FW_BRIDGEWATCH;1;matheussampaio2;Elder's Bridgewatch Cape`
      ].join('\n')

      const results = [...lines.matchAll(regex.lootLogRe)]

      expect(results.length).toBe(2)

      const result = results[0]

      expect(result).not.toBeNull()

      expect(result.groups.lootedAt).toBe('2021-06-07T22:25:16.432Z')
      expect(result.groups.lootedBy).toBe('matheussampaio1')
      expect(result.groups.itemId).toBe('T8_CAPEITEM_FW_BRIDGEWATCH')
      expect(result.groups.amount).toBe('1')
      expect(result.groups.lootedFrom).toBe('matheussampaio2')
      expect(result.groups.itemName).toBe(`Elder's Bridgewatch Cape`)
    })

    it('should NOT match with guilds member list', () => {
      const line = `matheussampaio`
      const results = [...line.matchAll(regex.lootLogRe)]

      expect(results.length).toBe(0)
    })

    it('should NOT match with guild logs as guilds member list', () => {
      const line = `"1"	"matheussampaio"	""	"55738"`
      const results = [...line.matchAll(regex.lootLogRe)]

      expect(results.length).toBe(0)
    })

    it('should NOT match with chest logs', () => {
      const line = `"06/10/2021 04:04:42"	"matheussampaio"	"Master's Relic"	"0"	"1"	"1"`
      const results = [...line.matchAll(regex.lootLogRe)]

      expect(results.length).toBe(0)
    })

    it('should NOT match with chest logs', () => {
      const line = `06/15/2021 19:52:26,matheussampaio,Adept's Martlock Cape,2,3,1`
      const results = [...line.matchAll(regex.aoLootLogRe)]

      expect(results.length).toBe(0)
    })
  })

  describe('Chest Logs Regex', () => {
    it('should match with chest logs', () => {
      const lines = [
        `"06/10/2021 04:04:42"	"matheussampaio"	"Master's Relic"	"0"	"1"	"1"`,
        `"06/10/2021 04:04:40"	"matheussampaio"	"Expert's Bag"	"0"	"2"	"1"`
      ].join('\n')
      const results = [...lines.matchAll(regex.chestLogRe)]

      expect(results.length).toBe(2)

      const result = results[0]

      expect(result).not.toBeNull()

      expect(result.groups.donatedAt).toBe('06/10/2021 04:04:42')
      expect(result.groups.donatedBy).toBe('matheussampaio')
      expect(result.groups.itemName).toBe(`Master's Relic`)
      expect(result.groups.itemEnchant).toBe('0')
      expect(result.groups.amount).toBe('1')
    })

    it('should NOT match with guilds member list', () => {
      const line = `matheussampaio`
      const results = [...line.matchAll(regex.chestLogRe)]

      expect(results.length).toBe(0)
    })

    it('should NOT match with guild logs as guilds member list', () => {
      const line = `"1"	"matheussampaio"	""	"55738"`
      const results = [...line.matchAll(regex.chestLogRe)]

      expect(results.length).toBe(0)
    })

    it('should NOT match with AO Loot Logs style', () => {
      const line = `5/7/2021 3:00:02;matheussampaio1;T7_POTION_STONESKIN;200;matheussampaio2`
      const results = [...line.matchAll(regex.chestLogRe)]

      expect(results.length).toBe(0)
    })

    it('should NOT match with MS Loot Logs style', () => {
      const line = `2021-06-07T22:25:16.432Z;matheussampaio1;T8_CAPEITEM_FW_BRIDGEWATCH;1;matheussampaio2;Elder's Bridgewatch Cape`
      const results = [...line.matchAll(regex.chestLogRe)]

      expect(results.length).toBe(0)
    })

    it('should NOT match with chest logs head', () => {
      const line = `"Date"	"Player"	"Item"	"Enchantment"	"Quality"	"Amount"`
      const results = [...line.matchAll(regex.chestLogRe)]

      expect(results.length).toBe(0)
    })
  })

  describe('Chest Logs CSV Regex', () => {
    it('should match with chest logs', () => {
      const lines = [
        `06/10/2021 04:04:42;matheussampaio;Master's Relic;0;1;1`,
        `06/10/2021 04:04:40;matheussampaio;Expert's Bag;0;2;1`
      ].join('\n')
      const results = [...lines.matchAll(regex.chestLogSsvRe)]

      expect(results.length).toBe(2)

      const result = results[0]

      expect(result).not.toBeNull()

      expect(result.groups.donatedAt).toBe('06/10/2021 04:04:42')
      expect(result.groups.donatedBy).toBe('matheussampaio')
      expect(result.groups.itemName).toBe(`Master's Relic`)
      expect(result.groups.itemEnchant).toBe('0')
      expect(result.groups.amount).toBe('1')
    })

    it('should NOT match with guilds member list', () => {
      const line = `matheussampaio`
      const results = [...line.matchAll(regex.chestLogSsvRe)]

      expect(results.length).toBe(0)
    })

    it('should NOT match with guild logs as guilds member list', () => {
      const line = `"1"	"matheussampaio"	""	"55738"`
      const results = [...line.matchAll(regex.chestLogSsvRe)]

      expect(results.length).toBe(0)
    })

    it('should NOT match with AO Loot Logs style', () => {
      const line = `5/7/2021 3:00:02;matheussampaio1;T7_POTION_STONESKIN;200;matheussampaio2`
      const results = [...line.matchAll(regex.chestLogSsvRe)]

      expect(results.length).toBe(0)
    })

    it('should NOT match with MS Loot Logs style', () => {
      const line = `2021-06-07T22:25:16.432Z;matheussampaio1;T8_CAPEITEM_FW_BRIDGEWATCH;1;matheussampaio2;Elder's Bridgewatch Cape`
      const results = [...line.matchAll(regex.chestLogSsvRe)]

      expect(results.length).toBe(0)
    })

    it('should NOT match with chest logs head', () => {
      const line = `"Date"	"Player"	"Item"	"Enchantment"	"Quality"	"Amount"`
      const results = [...line.matchAll(regex.chestLogSsvRe)]

      expect(results.length).toBe(0)
    })
  })

  describe('Chest Logs CSV Regex', () => {
    it('should match with chest logs', () => {
      const lines = [
        `06/15/2021 18:58:43,matheussampaio,Grandmaster's Knight Helmet,1,2,-5`,
        `06/15/2021 19:52:26,matheussampaio,Adept's Martlock Cape,2,3,1`
      ].join('\n')
      const results = [...lines.matchAll(regex.chestLogCsvRe)]

      expect(results.length).toBe(2)

      const result = results[0]

      expect(result).not.toBeNull()

      expect(result.groups.donatedAt).toBe('06/15/2021 18:58:43')
      expect(result.groups.donatedBy).toBe('matheussampaio')
      expect(result.groups.itemName).toBe(`Grandmaster's Knight Helmet`)
      expect(result.groups.itemEnchant).toBe('1')
      expect(result.groups.amount).toBe('-5')
    })

    it('should NOT match with guilds member list', () => {
      const line = `matheussampaio`
      const results = [...line.matchAll(regex.chestLogCsvRe)]

      expect(results.length).toBe(0)
    })

    it('should NOT match with guild logs as guilds member list', () => {
      const line = `"1"	"matheussampaio"	""	"55738"`
      const results = [...line.matchAll(regex.chestLogCsvRe)]

      expect(results.length).toBe(0)
    })

    it('should NOT match with AO Loot Logs style', () => {
      const line = `5/7/2021 3:00:02;matheussampaio1;T7_POTION_STONESKIN;200;matheussampaio2`
      const results = [...line.matchAll(regex.chestLogCsvRe)]

      expect(results.length).toBe(0)
    })

    it('should NOT match with MS Loot Logs style', () => {
      const line = `2021-06-07T22:25:16.432Z;matheussampaio1;T8_CAPEITEM_FW_BRIDGEWATCH;1;matheussampaio2;Elder's Bridgewatch Cape`
      const results = [...line.matchAll(regex.chestLogCsvRe)]

      expect(results.length).toBe(0)
    })

    it('should NOT match with chest logs head', () => {
      const line = `Date,Player,Item,Enchantment,Quality,Amount`
      const results = [...line.matchAll(regex.chestLogCsvRe)]

      expect(results.length).toBe(0)
    })
  })

  describe('Guild Member List Regex', () => {
    it('should match with guild logs member list', () => {
      const lines = [`"1"	"matheussampaio"	""	"55738"`, `"1"	"username2"	""	"10000"`].join('\n')
      const results = [...lines.matchAll(regex.guildMemberLogRe)]

      expect(results.length).toBe(2)

      const result = results[0]

      expect(result).not.toBeNull()

      expect(result.groups.userName1).toBe('matheussampaio')
    })

    it('should match with custom member list file', () => {
      const lines = [`matheussampaio`, `matheussampaio1`].join('\n')
      const results = [...lines.matchAll(regex.guildMemberLogRe)]

      expect(results.length).toBe(2)

      const result = results[0]

      expect(result).not.toBeNull()

      expect(result.groups.userName2).toBe('matheussampaio')
    })

    it('should NOT match with AO Loot Logs style', () => {
      const line = `5/7/2021 3:00:02;matheussampaio1;T7_POTION_STONESKIN;200;matheussampaio2`
      const results = [...line.matchAll(regex.guildMemberLogRe)]

      expect(results.length).toBe(0)
    })

    it('should NOT match with MS Loot Logs style', () => {
      const line = `2021-06-07T22:25:16.432Z;matheussampaio1;T8_CAPEITEM_FW_BRIDGEWATCH;1;matheussampaio2;Elder's Bridgewatch Cape`
      const results = [...line.matchAll(regex.guildMemberLogRe)]

      expect(results.length).toBe(0)
    })

    it('should NOT match with chest logs', () => {
      const line = `"06/10/2021 04:04:42"	"matheussampaio"	"Master's Relic"	"0"	"1"	"1"`
      const results = [...line.matchAll(regex.guildMemberLogRe)]

      expect(results.length).toBe(0)
    })

    it('should NOT match with guild logs head', () => {
      const line = `"Rank"	"Player"	"Guild Role"	"Amount"`
      const results = [...line.matchAll(regex.guildMemberLogRe)]

      expect(results.length).toBe(0)
    })

    it('should NOT match with chest logs', () => {
      const line = `06/15/2021 19:52:26,matheussampaio,Adept's Martlock Cape,2,3,1`
      const results = [...line.matchAll(regex.aoLootLogRe)]

      expect(results.length).toBe(0)
    })
  })
})

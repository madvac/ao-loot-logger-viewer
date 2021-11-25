import regex from './regex'

const fixtures = {
  aoLootLogRe: {
    regex: regex.aoLootLogRe,
    matches: 2,
    text: [
      `"12.6.2021 17.40.50","matheussampaio1","Guild Name 1","","Adept's Carrioncaller (T4_2H_HALBERD_MORGANA)","1x               0                          0             4,598             4,497             0             0","AnotherPlayer"`,
      `"12.6.2021 17.40.50","matheussampaio2","Guild Name 2","","Journeyman's Riding Horse (T3_MOUNT_HORSE)","1x               10,399                          10,748             11,677             10,939             10,649             11,275","AnotherPlayer"`
    ].join('\n')
  },
  lootLogRe: {
    regex: regex.lootLogRe,
    matches: 4,
    text: [
      `5/7/2021 3:00:02;matheussampaio1;T7_POTION_STONESKIN;200;matheussampaio2`,
      `5/7/2021 3:00:02;matheussampaio1;T7_POTION_STONESKIN;200;matheussampaio2`,
      `2021-06-07T22:25:16.432Z;matheussampaio1;T8_CAPEITEM_FW_BRIDGEWATCH;1;matheussampaio2;Elder's Bridgewatch Cape`,
      `2021-06-07T22:25:16.432Z;matheussampaio1;T8_CAPEITEM_FW_BRIDGEWATCH;1;matheussampaio2;Elder's Bridgewatch Cape`
    ].join('\n')
  },
  chestLogRe: {
    regex: regex.chestLogRe,
    matches: 2,
    text: [
      `"06/10/2021 04:04:42"	"matheussampaio"	"Master's Relic"	"0"	"1"	"1"`,
      `"06/10/2021 04:04:40"	"matheussampaio"	"Expert's Bag"	"0"	"2"	"1"`
    ].join('\n')
  },
  chestLogSsvRe: {
    regex: regex.chestLogSsvRe,
    matches: 2,
    text: [
      `06/10/2021 04:04:42;matheussampaio;Master's Relic;0;1;1`,
      `06/10/2021 04:04:40;matheussampaio;Expert's Bag;0;2;1`
    ].join('\n')
  },
  chestLogCsvRe: {
    regex: regex.chestLogCsvRe,
    matches: 2,
    text: [
      `06/15/2021 18:58:43,matheussampaio,Grandmaster's Knight Helmet,1,2,-5`,
      `06/15/2021 19:52:26,matheussampaio,Adept's Martlock Cape,2,3,1`
    ].join('\n')
  },
  guildMemberLogRe: {
    regex: regex.guildMemberLogRe,
    matches: 7,
    text: [
      `"1"	"randomuser1"	""	"55738"`,
      `"1"	"username2"	""	"10000"`,
      `randomuser2`,
      `randomuser3`,
      `3,randomuser4,,3612872`,
      `4,randomuser5,,2337752`,
      `5,randomuser6,,2211482`
    ].join('\n')
  },
  v2LootLogRe: {
    regex: regex.v2LootLogRe,
    matches: 2,
    text: [
      `2021-11-23T03:40:00.662Z;allianceBy;guild by;randomuser;T6_HEAD_LEATHER_ROYAL@2;Master's Royal Hood;1;alliance from;guild from;matheussampaio`,
      `2021-11-23T03:40:00.662Z;;;randomuser;T6_HEAD_LEATHER_ROYAL@2;Master's Royal Hood;1;;;matheussampaio`
    ].join('\n')
  }
}

describe('Regex', () => {
  for (let id in fixtures) {
    describe(`.${id}`, () => {
      it(`should match with ${id}'s own data`, () => {
        const results = [...fixtures[id].text.matchAll(fixtures[id].regex)]

        expect(results.length).toBe(fixtures[id].matches)
      })

      for (let other in fixtures) {
        if (id === other) {
          continue
        }

        it(`should NOT match with ${other}'s data`, () => {
          const results = [...fixtures[other].text.matchAll(fixtures[id].regex)]

          expect(results.length).toBe(0)
        })
      }
    })
  }
})

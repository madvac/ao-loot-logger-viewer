import regex from './regex'

const fixtures = {
  aoLootLogRe: {
    regex: regex.aoLootLogRe,
    matches: 2,
    text: [
      `"12.6.2021 17.40.50","matheussampaio1","Guild Name 1","","Adept's Carrioncaller (T4_2H_HALBERD_MORGANA)","1x               0                          0             4,598             4,497             0             0","AnotherPlayer"`,
      `"12.6.2021 17.40.50","matheussampaio2","Guild Name 2","","Journeyman's Riding Horse (T3_MOUNT_HORSE)","1x               10,399                          10,748             11,677             10,939             10,649             11,275","AnotherPlayer"`
    ]
  },
  lootLogRe: {
    regex: regex.lootLogRe,
    matches: 5,
    text: [
      `5/7/2021 3:00:02;matheussampaio1;T7_POTION_STONESKIN;200;matheussampaio2`,
      `5/7/2021 3:00:02;matheussampaio1;T7_POTION_STONESKIN;200;matheussampaio2`,
      `2021-06-07T22:25:16.432Z;matheussampaio1;T8_CAPEITEM_FW_BRIDGEWATCH;1;matheussampaio2;Elder's Bridgewatch Cape`,
      `2021-06-07T22:25:16.432Z;matheussampaio1;T8_CAPEITEM_FW_BRIDGEWATCH;1;matheussampaio2;Elder's Bridgewatch Cape`,
      `05/20/2022 13:57:52;QIANGWEIHUA;娴熟级背包;1;NETD2544`
    ]
  },
  chestLogRe: {
    regex: regex.chestLogRe,
    matches: 3,
    text: [
      `"06/10/2021 04:04:42"	"matheussampaio"	"Master's Relic"	"0"	"1"	"1"`,
      `"06/10/2021 04:04:42" "matheussampaio" "Master's Relic" "0" "1" "1"`,
      `"06/10/2021 04:04:40"	"matheussampaio"	"Expert's Bag"	"0"	"2"	"1"`
    ]
  },
  chestLogSsvRe: {
    regex: regex.chestLogSsvRe,
    matches: 2,
    text: [
      `06/10/2021 04:04:42;matheussampaio;Master's Relic;0;1;1`,
      `06/10/2021 04:04:40;matheussampaio;Expert's Bag;0;2;1`
    ]
  },
  chestLogCsvRe: {
    regex: regex.chestLogCsvRe,
    matches: 2,
    text: [
      `06/15/2021 18:58:43,matheussampaio,Grandmaster's Knight Helmet,1,2,-5`,
      `06/15/2021 19:52:26,matheussampaio,Adept's Martlock Cape,2,3,1`
    ]
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
    ]
  },
  v2LootLogRe: {
    regex: regex.v2LootLogRe,
    matches: 4,
    text: [
      `2021-11-23T03:40:00.662Z;allianceBy;guild by;randomuser;T6_HEAD_LEATHER_ROYAL@2;Master's Royal Hood;1;alliance from;guild from;matheussampaio`,
      `2021-11-23T03:40:00.662Z;;;randomuser;T6_HEAD_LEATHER_ROYAL@2;Master's Royal Hood;1;;;matheussampaio`,
      `2022-02-01T21:07:12.397Z;;;DarkShadowZ1;T4_RUNE;Adept's Rune;4;;;@MOB_T6_MOB_RD_AVALON_MORTAR_ELITE`,
      `2022-02-01T21:07:12.618Z;;;NiceTrade;T5_RUNE;Expert's Rune;1;;;@MOB_T6_MOB_RD_AVALON_MORTAR_ELITE`
    ]
  }
}

describe('Regex', () => {
  for (let id in fixtures) {
    describe(`.${id}`, () => {
      for (const fixture of fixtures[id].text) {
        it(`should match with "${fixture}"`, () => {
          expect(fixture.match(fixtures[id].regex)).toBeTruthy()
        })
      }

      for (let other in fixtures) {
        if (id === other) {
          continue
        }

        for (const fixture of fixtures[other].text) {
          it(`should NOT match with "${fixture}"`, () => {
            expect(fixture.match(fixtures[id].regex)).toBeFalsy()
          })
        }
      }
    })
  }
})

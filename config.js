/* eslint-disable prefer-const */

// bot settings
const msEmail = 'iefn29fing98n3@outlook.com'
const msPassword = '9Bf$qBk^^yu#NGVn3q2i8a^q3f$hKA'
const botToken = 'MTA4NjQxNDM2MzgxNDAwMjg4OQ.GStcCC.xEXdn3iBalqy5x6fuKxJa69LI3CttAdtEqVrx4'
const channelId = '1082122512357404732'

// game settings
const mcServer = 'play.fennet.rentals'
const mcPort = '25565'
const mcVersion = '1.19.3'

// in-game settings
const whitelist = ['Vixy', 'cat_yawn', 'Egirl39', 'AK50']
const dropBlacklist = ['bread']
const hoeItems = ['netherite_hoe', 'diamond_hoe', 'golden_hoe', 'iron_hoe', 'stone_hoe', 'wooden_hoe']
const RANGE_GOAL = 1

// not constants
let doLook = true
let doFarm = false

// feature settings
const pearls = {
  April: { x: 992, y: 43, z: 1880 },
  Kate: { x: 994, y: 43, z: 1880 },
  ion: { x: 997, y: 43, z: 1885 }
}

module.exports = {
  msEmail,
  msPassword,
  botToken,
  channelId,
  mcServer,
  mcPort,
  mcVersion,
  whitelist,
  dropBlacklist: dropBlacklist.concat(hoeItems),
  hoeItems,
  RANGE_GOAL,
  doLook,
  doFarm,
  pearls
}

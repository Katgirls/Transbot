/* eslint-disable prefer-const */

// bot settings
const msEmail = '***REMOVED***'
const msPassword = '***REMOVED***'
const botToken = '***REMOVED***'
const channelId = '***REMOVED***'

// game settings
const mcServer = 'play.fennet.rentals'
const mcPort = '25565'
const mcVersion = '1.19.3'

// in-game settings
const whitelist = ['***REMOVED***', 'cat_yawn', 'Egirl39', '***REMOVED***']
const dropBlacklist = ['bread']
const hoeItems = ['netherite_hoe', 'diamond_hoe', 'golden_hoe', 'iron_hoe', 'stone_hoe', 'wooden_hoe']
const RANGE_GOAL = 1

// not constants
let doLook = true
let doFarm = false

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
  doFarm
}

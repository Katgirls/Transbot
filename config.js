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
  RANGE_GOAL,
  doLook,
  doFarm,
  pearls
}

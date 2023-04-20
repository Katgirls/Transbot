const https = require('https')

const config = require('./config.js')

const mfpfPkg = require('mineflayer-pathfinder')

const { Movements, goals } = mfpfPkg
const { GoalNear } = goals

const { Vec3 } = require('vec3')

let bot
let defaultMove

function setBot (_bot) {
  bot = _bot
  defaultMove = new Movements(bot)
}

function dropAll () {
  const excludedItems = ['bread']
  const item = bot.inventory
    .items()
    .find((item) => !excludedItems.includes(item.name))
  if (item) {
    bot
      .tossStack(item)
      .then(() => {
        setTimeout(dropAll)
      })
      .catch((err) => {
        console.log(err)
        setTimeout(dropAll, 100)
      })
  }
}

async function loadPearl (target) {
  let blockData

  switch (target) {
    case '***REMOVED***':
      blockData = new Vec3(config.pearls.April.x, config.pearls.April.y, config.pearls.April.z)
      break
    case '***REMOVED***':
    case 'Egirl39':
      blockData = new Vec3(config.pearls.ion.x, config.pearls.ion.y, config.pearls.ion.z)
      break
    case 'cat_yawn':
      blockData = new Vec3(config.pearls.Kate.x, config.pearls.Kate.y, config.pearls.Kate.z)
      break
  }

  if (bot.entity.position.distanceTo(blockData) > 3) {
    bot.pathfinder.setMovements(defaultMove)
    await bot.pathfinder.goto(
      new GoalNear(
        blockData.x,
        blockData.y,
        blockData.z,
        3
      )
    )
  }

  console.log('Loading')

  bot._client.write('block_place', {
    location: blockData,
    direction: 0,
    hand: 0,
    cursorX: 0,
    cursorY: 1,
    cursorZ: 0
  })
}

function sayUselessFact () {
  try {
    https
      .get('https://uselessfacts.jsph.pl/api/v2/facts/random', (res) => {
        if (res.statusCode !== 200) {
          bot.chat('Sorry, I Failed to fetch the information from the API :(')
        } else {
          let data = ''

          // Do cool stuffs

          res.once('data', (chunk) => {
            data += chunk
          })

          res.once('end', () => {
            const fact = JSON.parse(data).text
            if (fact.length > 254) {
              bot.chat(
                'Sorry gang, the silly fact was too long (>255) to send :('
              ) // HISS
            } else {
              bot.chat(fact) // MEOW
            }
          })
        }
      })
      .once('error', (err) => {
        console.error('Error:', err.message)
      })
  } catch (error) {
    console.error(error.message)
  }
}

function sayCatFact () {
  try {
    https
      .get('https://catfact.ninja/fact', (res) => {
        // Getting a little silly wid it >:3
        if (res.statusCode !== 200) {
          bot.chat('Sorry, I Failed to fetch the information from the API :(') // Cry to chat
        } else {
          let data = ''

          // Do cool stuffs

          res.once('data', (chunk) => {
            data += chunk
          })

          res.once('end', () => {
            const fact = JSON.parse(data).fact
            if (fact.length > 254) {
              bot.chat(
                'Sorry gang, the silly fact was too long (>255) to send :('
              ) // HISS
            } else {
              bot.chat(fact) // MEOW
            }
          })
        }
      })
      .once('error', (err) => {
        console.error('Error:', err.message)
      })
  } catch (error) {
    console.error(error.message)
  }
}

async function goToSleep () {
  const bed = bot.findBlock({
    matching: (block) => bot.isABed(block)
  })
  if (bed) {
    try {
      await bot.sleep(bed)
      bot.chat('I\'m sleeping')
    } catch (err) {
      bot.chat(`I can't sleep: ${err.message}`)
    }
  } else {
    bot.chat('No nearby bed')
  }
}
async function wakeUp () {
  try {
    await bot.wake()
  } catch (err) {
    bot.chat(`I can't wake up: ${err.message}`)
  }
}

module.exports = {
  setBot,
  dropAll,
  sayUselessFact,
  sayCatFact,
  goToSleep,
  wakeUp,
  loadPearl
}

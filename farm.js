const mfpfPkg = require('mineflayer-pathfinder')

const { goals } = mfpfPkg
const { GoalNear } = goals

const config = require('./config.js')

let bot

function setBot (_bot) {
  bot = _bot
}

// function blockToSow(bot) {
//   return bot.findBlock({
//     point: bot.entity.position,
//     matching: bot.registry.blocksByName.farmland.id,
//     maxDistance: 50,
//     useExtraInfo: (block) => {
//       const blockAbove = bot.blockAt(block.position.offset(0, 1, 0))
//       return !blockAbove || blockAbove.type === 0
//     },
//   })
// }

function blocksToHarvest () {
  return bot.findBlocks({
    point: bot.entity.position,
    maxDistance: 40,
    matching: (block) => {
      return (
        block &&
        block.type === bot.registry.blocksByName.wheat.id &&
        block.metadata === 7
      )
    }
  })
}

async function perform () {
  const Item = require('prismarine-item')(bot.registry)

  // TODO: prioritize hoes with Fortune (more drops)
  if (!config.hoeItems.includes(bot.heldItem?.name)) {
    const inventory = bot.inventory.items()

    /* eslint-disable no-labels */
    loopHoeItems:
    for (const hoe of config.hoeItems) {
      for (const item of inventory) {
        if (item.name === hoe) {
          bot.equip(item, 'hand')
          break loopHoeItems
        }
      }
    }
  }

  try {
    let toHarvests = null
    toHarvests = blocksToHarvest()

    if (toHarvests) {
      for (const block of toHarvests) {
        if (bot.entity.position.distanceTo(block) > 3) {
          await bot.pathfinder.goto(
            new GoalNear(
              block.x,
              block.y,
              block.z,
              1
            )
          )
        }

        console.log(block)

        // it's faster to send our own packets
        bot._client.write('block_place', {
          location: block,
          direction: 0,
          heldItem: Item.toNotch(bot.heldItem),
          cursorX: 0.5,
          cursorY: 0.5,
          cursorZ: 0.5
        })
      }
    }
  } catch (e) {
    console.log(e)
  }
}

module.exports = { setBot, perform }

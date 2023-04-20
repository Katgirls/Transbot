const mfpfPkg = require('mineflayer-pathfinder')

const { goals } = mfpfPkg
const { GoalNear } = goals

const config = require('./config.js')

let bot

const positionsToRemove = [
  { x: -1, y: 0, z: -1 },
  { x: -1, y: 0, z: 0 },
  { x: -1, y: 0, z: 1 },
  { x: 0, y: 0, z: -1 },
  { x: 0, y: 0, z: 1 },
  { x: 1, y: 0, z: -1 },
  { x: 1, y: 0, z: 0 },
  { x: 1, y: 0, z: 1 }
]

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
  const blocks = bot.findBlocks({
    matching: (block) => {
      return (
        block &&
        block.type === bot.registry.blocksByName.wheat.id &&
        block.metadata === 7
      )
    },
    maxDistance: 64,
    count: 420
  })

  console.log(blocks.length)
  return blocks
}

async function perform () {
  const Item = require('prismarine-item')(bot.registry)

  try {
    let toHarvests = null
    toHarvests = blocksToHarvest()
    console.log(toHarvests.length)

    // Sort the toHarvests array by distance (to us)
    if (toHarvests && toHarvests.length > 0) {
      // Pick the first block in the array as the reference block
      const refBlock = toHarvests[0]

      // Sort the rest of the blocks based on their distance to the reference block
      toHarvests.slice(1).sort((a, b) => {
        if (!a || !b) return 0
        // Calculate the distance from the reference block to block `a`
        const distA = refBlock.distanceTo(a)
        // Calculate the distance from the reference block to block `b`
        const distB = refBlock.distanceTo(b)
        // Return the delta, negative if 'a' is closer,
        // positive if 'b' is closer, and zero if they are the same distance
        return distA - distB
      })
    } else {
      bot.chat('No blocks to harvest.')
      return
    }

    for (const blockPos of toHarvests) {
      const block = bot.blockAt(blockPos)

      if (!block) { // IDK how this would trigger but...
        continue
      }

      for (const pos of positionsToRemove) {
        const removePos = blockPos.plus(pos)
        for (let i = 0; i < toHarvests.length; i++) {
          const blockPos = toHarvests[i]

          if (blockPos.equals(removePos)) {
            console.log(i)
            toHarvests.splice(i, 1)
            break
          }
        }
      }
    }

    console.log(toHarvests)

    console.log('Start farming.')

    for (let i = 0; i < toHarvests.length; i++) {
      const block = toHarvests[i]

      if (!block) {
        continue
      }

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

      await new Promise(resolve => setTimeout(resolve, 125))
    }

    bot.chat('Done farming!')
    config.doFarm = false
    config.doLook = true
  } catch (e) {
    console.log(e)
  }
}

module.exports = { setBot, perform }

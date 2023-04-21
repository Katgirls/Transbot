const mfpfPkg = require('mineflayer-pathfinder')

const { goals } = mfpfPkg
const { GoalNear } = goals

const config = require('./config.js')

let bot
const maxBlockDistance = 6

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
    maxDistance: 69,
    count: 420
  })

  for (const blockPos of blocks) {
    const block = bot.blockAt(blockPos)

    if (!block) { // IDK how this would trigger but...
      continue
    }

    for (const pos of positionsToRemove) {
      const removePos = blockPos.plus(pos)
      for (let i = 0; i < blocks.length; i++) {
        const blockPos = blocks[i]

        if (blockPos.equals(removePos)) {
          console.log(i)
          blocks.splice(i, 1)
          break
        }
      }
    }
  }

  console.log(blocks.length)
  return blocks
}

async function perform () {
  const Item = require('prismarine-item')(bot.registry)

  try {
    let toHarvests = null
    toHarvests = blocksToHarvest()
    console.log(toHarvests.length)

    // THANKS CHATGPT
    /*
    Here's how the algorithm works:

    Pick an arbitrary starting block and add it to the sortedBlocks array.
    Find the nearest block to the last block in the sortedBlocks array, remove it from the toHarvests array, and add it to the sortedBlocks array.
    Repeat step 2 until there are no blocks left in the toHarvests array.
    The resulting sortedBlocks array will contain the blocks in the order that the bot should harvest them to minimize the walking distance. The bot then walks to and harvests each block in the sortedBlocks array.
    */

    let sortedBlocks = null

    // Sort the toHarvests array by distance (to us)
    if (toHarvests && toHarvests.length > 0) {
      // Sort the blocks using a nearest-neighbor algorithm
      sortedBlocks = [toHarvests.shift()]
      while (toHarvests.length > 0) {
        let nearestBlock
        let nearestDistance = Infinity
        for (const block of toHarvests) {
          const distance = sortedBlocks[sortedBlocks.length - 1].distanceTo(block)
          if (distance < nearestDistance) {
            nearestBlock = block
            nearestDistance = distance
          }
        }
        sortedBlocks.push(nearestBlock)
        toHarvests.splice(toHarvests.indexOf(nearestBlock), 1)
      }
    } else {
      bot.chat('No blocks to harvest.')
      return
    }

    console.log(sortedBlocks)

    console.log('Start farming.')

    for (let i = 0; i < sortedBlocks.length; i++) {
      const block = sortedBlocks[i]

      if (!block) {
        continue
      }

      if (bot.entity.position.distanceTo(block) > maxBlockDistance) {
        await bot.pathfinder.goto(
          new GoalNear(
            block.x,
            block.y,
            block.z,
            0
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

      // await new Promise(resolve => setTimeout(resolve, 5)) // 50 millis = 1 tick (assume 20tps)
    }

    if (blocksToHarvest().length > 0) {
      perform()
    } else {
      bot.chat('Done farming!')
      config.doFarm = false
      config.doLook = true
    }
  } catch (e) {
    console.log(e)
  }
}

module.exports = { setBot, perform }

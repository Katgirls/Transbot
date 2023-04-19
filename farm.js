const mfpf_pkg = require("mineflayer-pathfinder");

const { goals } = mfpf_pkg;
const { GoalNear } = goals;
const { Vec3 } = require("vec3");

const config = require("./config.js");

let bot;

function set_bot(_bot) {
  bot = _bot;
}

// function blockToSow(bot) {
//   return bot.findBlock({
//     point: bot.entity.position,
//     matching: bot.registry.blocksByName.farmland.id,
//     maxDistance: 50,
//     useExtraInfo: (block) => {
//       const blockAbove = bot.blockAt(block.position.offset(0, 1, 0));
//       return !blockAbove || blockAbove.type === 0;
//     },
//   });
// }

function blockToHarvest() {
  return bot.findBlock({
    point: bot.entity.position,
    maxDistance: 6,
    matching: (block) => {
      return (
        block &&
        block.type === bot.registry.blocksByName.wheat.id &&
        block.metadata === 7
      );
    },
  });
}

/**
 * Convert a vector direction to minecraft packet number direction
 * @param {Vec3} v
 * @returns {number}
 */
function vectorToDirection(v) {
  if (v.y < 0) {
    return 0;
  } else if (v.y > 0) {
    return 1;
  } else if (v.z < 0) {
    return 2;
  } else if (v.z > 0) {
    return 3;
  } else if (v.x < 0) {
    return 4;
  } else if (v.x > 0) {
    return 5;
  }
  assert.ok(false, `invalid direction vector ${v}`);
}

async function perform() {
  const Item = require("prismarine-item")(bot.registry);

  try {
    var toHarvest = null;
    toHarvest = blockToHarvest();

    if (toHarvest) {
      if (bot.entity.position.distanceTo(toHarvest.position) > 3) {
        await bot.pathfinder.goto(
          new GoalNear(
            toHarvest.position.x,
            toHarvest.position.y,
            toHarvest.position.z,
            1
          )
        );
      }
      // await bot.dig(toHarvest);
      console.log(toHarvest.position);

      var direction = new Vec3(0, 1, 0);
      var directionNum = vectorToDirection(direction);
      var cursorPos = new Vec3(0.5, 0.5, 0.5);

      await bot.lookAt(toHarvest.position.offset(0.5, 0.5, 0.5), false);
      bot.activateBlock(toHarvest);
    }
  } catch (e) {
    console.log(e);
  }
}

module.exports = { set_bot, perform };

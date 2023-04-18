const mfpf_pkg = require("mineflayer-pathfinder");

const { goals } = mfpf_pkg;
const { GoalNear } = goals;

const config = require("./config.js");

let bot;

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

function blockToHarvest(bot) {
  return bot.findBlock({
    point: bot.entity.position,
    maxDistance: 50,
    matching: (block) => {
      return (
        block &&
        block.type === bot.registry.blocksByName.wheat.id &&
        block.metadata === 7
      );
    },
  });
}

function set_bot(_bot) {
  bot = _bot;
}

async function perform() {
  try {
    while (1) {
      if (!config.do_farm) {
        return;
      }

      const toHarvest = blockToHarvest(bot);

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
        bot.activateBlock(toHarvest);
      }

      //   else {
      //     const toSow = blockToSow(bot);
      //     if (toSow) {
      //       if (bot.entity.position.distanceTo(toSow.position) > 3) {
      //         await bot.pathfinder.goto(
      //           new GoalNear(
      //             toSow.position.x,
      //             toSow.position.y,
      //             toSow.position.z,
      //             1
      //           )
      //         );
      //       }
      //       await bot.equip(bot.registry.itemsByName.wheat_seeds.id, "hand");
      //       await bot.placeBlock(toSow, new Vec3(0, 1, 0));
      //     } else {
      //       break;
      //     }
      //   }
    }
  } catch (e) {
    console.log(e);
  }
}

module.exports = { set_bot, perform };

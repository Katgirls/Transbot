const https = require("https");

const config = require("./config.js");

let bot;

function set_bot(_bot) {
  bot = _bot;
}

function dropAll() {
  const excludedItems = ["bread"];
  const item = bot.inventory
    .items()
    .find((item) => !excludedItems.includes(item.name));
  if (item) {
    bot
      .tossStack(item)
      .then(() => {
        setTimeout(dropAll);
      })
      .catch((err) => {
        console.log(err);
        setTimeout(dropAll, 100);
      });
  }
}

function sayUselessFact() {
  try {
    https
      .get("https://uselessfacts.jsph.pl/api/v2/facts/random", (res) => {
        if (res.statusCode !== 200) {
          bot.chat("Sorry, I Failed to fetch the information from the API :(");
        } else {
          let data = "";

          // Do cool stuffs

          res.once("data", (chunk) => {
            data += chunk;
          });

          res.once("end", () => {
            var fact = JSON.parse(data);
            fact = fact.text;
            if (fact.length > 254) {
              bot.chat(
                "Sorry gang, the silly fact was too long (>255) to send :("
              ); // HISS
            } else {
              bot.chat(fact); // MEOW
            }
          });
        }
      })
      .once("error", (err) => {
        console.error("Error:", err.message);
      });
  } catch (error) {
    console.error(error.message);
  }
}

function sayCatFact() {
  try {
    https
      .get("https://catfact.ninja/fact", (res) => {
        //Getting a little silly wid it >:3
        if (res.statusCode !== 200) {
          bot.chat("Sorry, I Failed to fetch the information from the API :("); // Cry to chat
        } else {
          let data = "";

          // Do cool stuffs

          res.once("data", (chunk) => {
            data += chunk;
          });

          res.once("end", () => {
            var fact = JSON.parse(data).fact;
            if (fact.length > 254) {
              bot.chat(
                "Sorry gang, the silly fact was too long (>255) to send :("
              ); // HISS
            } else {
              bot.chat(fact); // MEOW
            }
          });
        }
      })
      .once("error", (err) => {
        console.error("Error:", err.message);
      });
  } catch (error) {
    console.error(error.message);
  }
}

async function goToSleep() {
  const bed = bot.findBlock({
    matching: (block) => bot.isABed(block),
  });
  if (bed) {
    try {
      await bot.sleep(bed);
      bot.chat("I'm sleeping");
    } catch (err) {
      bot.chat(`I can't sleep: ${err.message}`);
    }
  } else {
    bot.chat("No nearby bed");
  }
}
async function wakeUp() {
  try {
    await bot.wake();
  } catch (err) {
    bot.chat(`I can't wake up: ${err.message}`);
  }
}

module.exports = {
  set_bot,
  dropAll,
  sayUselessFact,
  sayCatFact,
  goToSleep,
  wakeUp,
};

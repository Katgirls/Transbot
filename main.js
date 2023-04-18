const mineflayer = require("mineflayer");
const https = require("https");
const Discord = require("discord.js");
const { Client, GatewayIntentBits, EmbedBuilder } = Discord;
const mfpf_pkg = require("mineflayer-pathfinder");
const { pathfinder, Movements, goals } = mfpf_pkg;
const { GoalNear, GoalFollow } = goals;
const autoeat = require("mineflayer-auto-eat").plugin;
const uuid = require("uuid-1345");

function setup() {
  const { MessageContent, GuildMessages, Guilds } = GatewayIntentBits;

  console.log(`Email: ${process.env.EMAIL}`);
  console.log(`Password: ${process.env.PASSWORD}`);
  console.log(`Token: ${process.env.TOKEN}`);

  let channel_id = `1082122512357404732`;

  const client = new Client({
    intents: [Guilds, GuildMessages, MessageContent],
  });

  var channel = -1;

  const RANGE_GOAL = 1;

  var do_look = true;

  const whitelist = ["Vixy", "cat_yawn"];

  console.log("Does this print twice?");

  const bot = mineflayer.createBot({
    username: process.env.EMAIL,
    password: process.env.PASSWORD,
    auth: "microsoft",
    host: "play.fennet.rentals",
    version: "1.19.3",
  });

  bot.loadPlugin(pathfinder);
  bot.loadPlugin(autoeat);

  bot.once("spawn", () => {
    // console.log(bot._client.profileKeys)
    // console.log(bot._client.cipher)

    console.log("Trans rights!! (I spawned btw hehe) >w<");

    advertise();

    setInterval(() => {
      if (do_look) {
        const entity = bot.nearestEntity((entity) => entity.type === "player");
        if (entity !== null) {
          bot.lookAt(entity.position.offset(0, 1.6, 0));
        }
      }
    }, 25);

    // const interval = setInterval(advertise, 2700000);
    const interval = setInterval(advertise, 21600000);
  });

  bot.on("sleep", () => {
    bot.chat("I just got in a nice warm bed");
  });

  bot.on("wake", () => {
    bot.chat("I just got out of bed, but I'm still so sleepy :(");
  });

  bot.once("login", () => {
    bot._client._session = {
      index: 0,
      uuid: uuid.v4fast(),
    };

    bot._client.write("session", {
      sessionUUID: bot._client._session.uuid,
      expireTime: bot._client.profileKeys
        ? BigInt(bot._client.profileKeys.expiresOn.getTime())
        : undefined,
      publicKey: bot._client.profileKeys
        ? bot._client.profileKeys.public.export({ type: "spki", format: "der" })
        : undefined,
      signature: bot._client.profileKeys
        ? bot._client.profileKeys.signatureV2
        : undefined,
    });

    bot.autoEat.options = {
      priority: "foodPoints",
      startAt: 14,
      bannedFood: [],
    };
  });

  // client.once('debug', console.log);

  client.once("ready", (c) => {
    console.log(`Discord bot logged in as ${c.user.tag}`);
    channel = client.channels.cache.get(channel_id);
    if (!channel) {
      console.log(`I could not find the channel`);
      process.exit(1);
    }
  });

  bot.on("autoeat_started", () => {
    console.log("Auto Eat started!");
  });

  bot.on("autoeat_stopped", () => {
    console.log("Auto Eat stopped!");
  });

  bot.on("health", () => {
    if (bot.food === 20) bot.autoEat.disable();
    // Disable the plugin if the bot is at 20 food points
    else bot.autoEat.enable(); // Else enable the plugin again
  });

  bot.on("chat", (username, message) => {
    console.log("chat");

    try {
      if (username !== bot.username) {
        const messageEmbed = new EmbedBuilder()
          .setColor(0x0099ff)
          .setTitle("New Message")
          .setDescription(`[${username}] ${message}`)
          .setTimestamp();
        channel.send({ embeds: [messageEmbed] });
      }
    } catch (error) {
      console.error(error.message);
    }
  });

  bot.on("path_update", (r) => {
    do_look = false;
    const nodesPerTick = ((r.visitedNodes * 50) / r.time).toFixed(2);
    console.log(
      `I can get there in ${
        r.path.length
      } moves. Computation took ${r.time.toFixed(2)} ms (${
        r.visitedNodes
      } nodes, ${nodesPerTick} nodes/tick)`
    );
  });

  bot.on("goal_reached", (goal) => {
    console.log("Here I am! @ " + goal);
    do_look = true;
  });

  bot.on("path_reset", (reason) => {
    console.log(`Path was reset for reason: ${reason}`);
  });

  bot._client.on("playerChat", (data) => {
    console.log("playerChat");
    try {
      const senderObj = JSON.parse(data.senderName);
      const messageObj = JSON.parse(data.formattedMessage);
      const extraArray = senderObj.extra;
      const senderName = extraArray[0].hoverEvent.contents.text;
      const message = messageObj.text;

      console.log(senderName + ": " + message);

      const defaultMove = new Movements(bot);

      if (message === "*cat") {
        sayCatFact();
      }

      if (message === "*fact") {
        sayUselessFact();
      }

      if (message === "*stop") {
        if (!whitelist.includes(senderName)) {
          bot.chat("Sorry, you're not permitted to give me instructions");
        } else {
          bot._client.chat("Understood, I stopped my current task");
          bot.pathfinder.stop();
          do_look = true;
        }
      }

      if (message === "*come") {
        if (!whitelist.includes(senderName)) {
          bot.chat("Sorry, you're not permitted to give me instructions");
        } else {
          const target = bot.players[senderName]?.entity;
          if (!target) {
            bot.chat("You're not within my visual range");
            return;
          }
          bot.chat("Understood, I am now walking to you");
          const { x: playerX, y: playerY, z: playerZ } = target.position;

          bot.pathfinder.setMovements(defaultMove);
          bot.pathfinder.setGoal(
            new GoalNear(playerX, playerY, playerZ, RANGE_GOAL)
          );
        }
      }

      if (message === "*follow") {
        if (!whitelist.includes(senderName)) {
          bot.chat("Sorry, you're not permitted to give me instructions");
        } else {
          const target = bot.players[senderName]?.entity;
          if (!target) {
            bot.chat("You're not within my visual range");
            return;
          }
          bot.chat("Understood, I am now walking to you");
          const { x: playerX, y: playerY, z: playerZ } = target.position;

          bot.pathfinder.setMovements(defaultMove);
          bot.pathfinder.setGoal(new GoalFollow(target, 2), true);
        }
      }

      if (message === "*sleep") {
        goToSleep();
      }

      if (message === "*wakeup") {
        wakeUp();
      }

      const messageEmbed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setAuthor({
          name: senderName,
          iconURL: `https://mc-heads.net/avatar/${senderName}/`,
          url: `https://namemc.com/${senderName}`,
        })
        .setDescription(message)
        .setTimestamp();
      channel.send({ embeds: [messageEmbed] });
    } catch (error) {
      console.error(error.message);
    }
  });

  client.on("messageCreate", (message) => {
    if (message.channel.id !== channel.id) return;
    if (message.author.id === client.user.id) return;
    bot._client.chat(
      `${message.author.username}#${message.author.discriminator}: ${message.content}`
    );
  });

  bot.on("nonSpokenChat", (message) => {
    console.log(`Non spoken chat: ${message}`);
  });

  bot.on("action", (username, message) => {
    console.log(`${username} ${message}`);
  });

  bot.on("whisper", (username, message) => {
    const messageEmbed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setAuthor({
        name: `${username} Whispers`,
        iconURL: `https://mc-heads.net/avatar/${username}/`,
        url: `https://namemc.com/${username}`,
      })
      .setDescription(message)
      .setTimestamp();

    channel.send({ embeds: [messageEmbed] });
  });

  function advertise() {
    bot.chat(
      "Hi, I'm Transbot, for a list of my commands visit tenshi.gay/transbot"
    );
  }

  function sayUselessFact() {
    try {
      https
        .get("https://uselessfacts.jsph.pl/api/v2/facts/random", (res) => {
          if (res.statusCode !== 200) {
            bot._client.chat(
              "Sorry, I Failed to fetch the information from the API :("
            );
          } else {
            let data = "";

            // Do cool stuffs

            res.once("data", (chunk) => {
              data += chunk;
            });

            res.once("end", () => {
              const fact = JSON.parse(data).text;
              bot._client.chat(fact); // MEOW
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
            bot._client.chat(
              "Sorry, I Failed to fetch the information from the API :("
            ); // Cry to chat
          } else {
            let data = "";

            // Do cool stuffs

            res.once("data", (chunk) => {
              data += chunk;
            });

            res.once("end", () => {
              const fact = JSON.parse(data).fact;
              bot._client.chat(fact); // MEOW
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

  // // Log errors and kick reasons:
  bot.on("kicked", console.log);
  bot.on("error", console.log);
  bot.on("end", setup);

  client.login(process.env.TOKEN).catch(console.error);
}

setup();

const mineflayer = require("mineflayer");
const Discord = require("discord.js");
const uuid = require("uuid-1345");

const autoeat = require("mineflayer-auto-eat").plugin;
const mfpf_pkg = require("mineflayer-pathfinder");

const { pathfinder } = mfpf_pkg;
const { Client, GatewayIntentBits, EmbedBuilder } = Discord;

const farm = require("./farm.js");
const chat = require("./chat.js");
const commands = require("./commands.js");
const config = require("./config.js");
const features = require("./features.js");

function setup() {
  const { MessageContent, GuildMessages, Guilds } = GatewayIntentBits;

  console.log(`Email: ${config.ms_email}`);
  console.log(`Password: ${config.ms_password}`);
  console.log(`Token: ${config.bot_token}`);

  const client = new Client({
    intents: [Guilds, GuildMessages, MessageContent],
  });

  var channel = -1;

  console.log("Starting...");

  const bot = mineflayer.createBot({
    username: config.ms_email,
    password: config.ms_password,
    auth: "microsoft",
    host: config.mc_server,
    port: config.mc_port,
    version: config.mc_version,
  });

  bot.loadPlugin(pathfinder);
  bot.loadPlugin(autoeat);

  bot.once("spawn", () => {
    // console.log(bot._client.profileKeys)
    // console.log(bot._client.cipher)

    console.log("Trans rights!! (I spawned btw hehe) >w<");

    farm.set_bot(bot);
    commands.set_bot(bot);
    chat.set_bot(bot);
    features.set_bot(bot);

    advertise();

    setInterval(() => {
      if (config.do_look) {
        const entity = bot.nearestEntity((entity) => entity.type === "player");
        if (entity !== null) {
          bot.lookAt(entity.position.offset(0, 1.6, 0));
        }
      }
    }, 25);

    setInterval(() => {
      if (config.do_farm) {
        farm.perform();
      }
    }, 250);

    // const interval = setInterval(advertise, 2700000);
    const interval = setInterval(advertise, 21600000); // Send the help message every 6 hours
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
    channel = client.channels.cache.get(config.channel_id);
    if (!channel) {
      console.log("I could not find the channel");
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
    chat.chat(username, message, channel);
  });

  bot.on("path_update", (r) => {
    config.do_look = false;
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
    console.log("Path goal reached.");
    if (!config.do_farm) {
      config.do_look = true;
    }
  });

  bot.on("path_reset", (reason) => {
    console.log(`Path was reset for reason: ${reason}`);
  });

  bot._client.on("playerChat", (data) => {
    commands.chat(data, channel);
  });

  client.on("messageCreate", (message) => {
    if (message.channel.id !== channel.id) return;
    if (message.author.id === client.user.id) return;
    bot.chat(
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

  // // Log errors and kick reasons:
  bot.on("kicked", console.log);
  bot.on("error", console.log);
  bot.on("end", () => {
    setTimeout(() => {
      setup();
    }, 15000); // 15 seconds
  });

  client.login(config.bot_token).catch(console.error);
}

setup();

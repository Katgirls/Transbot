const Discord = require("discord.js");
const { EmbedBuilder } = Discord;

let bot;

function set_bot(_bot) {
  bot = _bot;
}

function chat(username, message, channel) {
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
}

module.exports = { set_bot, chat };

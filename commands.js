const Discord = require('discord.js')
const mfpfPkg = require('mineflayer-pathfinder')

const { EmbedBuilder } = Discord
const { Movements, goals } = mfpfPkg
const { GoalNear, GoalFollow } = goals

const config = require('./config.js')
const features = require('./features.js')

let bot

function setBot (_bot) {
  bot = _bot
}

function chat (data, channel) {
  console.log('playerChat')
  try {
    // something is very wrong here :(
    // why is the entire message in senderName!?
    const senderObj = JSON.parse(data.senderName)
    const extraArray = senderObj.extra
    const senderName = extraArray[0].hoverEvent.contents.text
    const message = extraArray[3].extra[0].text

    console.log(senderName + ': ' + message)

    const defaultMove = new Movements(bot)

    if (message === '*cat') {
      features.sayCatFact()
    }

    if (message === '*fact') {
      features.sayUselessFact()
    }

    if (message === '*stop') {
      if (!config.whitelist.includes(senderName)) {
        bot.chat('Sorry, you\'re not permitted to give me instructions')
      } else {
        bot.chat('Understood, I stopped my current task')
        bot.pathfinder.stop()
        config.doLook = true
        config.doFarm = false
      }
    }

    if (message === '*farm') {
      if (!config.whitelist.includes(senderName)) {
        bot.chat('Sorry, you\'re not permitted to give me instructions')
      } else {
        // bot.chat('Feature currently disabled');
        config.doLook = false
        config.doFarm = true
        bot.chat('Now farming!')
      }
    }

    if (message === '*dropall') {
      if (!config.whitelist.includes(senderName)) {
        bot.chat('Sorry, you\'re not permitted to give me instructions')
      } else {
        features.dropAll()
      }
    }

    if (message === '*come') {
      if (!config.whitelist.includes(senderName)) {
        bot.chat('Sorry, you\'re not permitted to give me instructions')
      } else {
        const target = bot.players[senderName]?.entity
        if (!target) {
          bot.chat('You\'re not within my visual range')
          return
        }
        bot.chat('Understood, I am now walking to you')
        const { x: playerX, y: playerY, z: playerZ } = target.position

        bot.pathfinder.setMovements(defaultMove)
        bot.pathfinder.setGoal(
          new GoalNear(playerX, playerY, playerZ, config.RANGE_GOAL)
        )
      }
    }

    if (message === '*follow') {
      if (!config.whitelist.includes(senderName)) {
        bot.chat('Sorry, you\'re not permitted to give me instructions')
      } else {
        const target = bot.players[senderName]?.entity
        if (!target) {
          bot.chat('You\'re not within my visual range')
          return
        }
        bot.chat('Understood, I am now walking to you')

        bot.pathfinder.setMovements(defaultMove)
        bot.pathfinder.setGoal(new GoalFollow(target, 2), true)
      }
    }

    if (message === '*sleep') {
      features.goToSleep()
    }

    if (message === '*wakeup') {
      features.wakeUp()
    }

    if (message === '*loadpearl') {
      if (!config.whitelist.includes(senderName)) {
        bot.chat('Sorry, you\'re not permitted to give me instructions')
      } else {
        features.loadPearl(senderName)
      }
    }

    const messageEmbed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setAuthor({
        name: senderName,
        iconURL: `https://mc-heads.net/avatar/${senderName}/`,
        url: `https://namemc.com/${senderName}`
      })
      .setDescription(message)
      .setTimestamp()
    channel.send({ embeds: [messageEmbed] })
  } catch (error) {
    console.error(error.message)
  }
}

module.exports = { setBot, chat }

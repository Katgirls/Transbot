import mineflayer from "mineflayer";
import chalk from "chalk";
import https from "https";
import { Client, GatewayIntentBits, EmbedBuilder } from "discord.js";
import uuid from "uuid-1345";

function createBot () {
  const { MessageContent, GuildMessages, Guilds } = GatewayIntentBits

  let channel = `1082122512357404732`
  const token = "MTA4NjQxNDM2MzgxNDAwMjg4OQ.GStcCC.xEXdn3iBalqy5x6fuKxJa69LI3CttAdtEqVrx4"

  const client = new Client({ intents: [Guilds, GuildMessages, MessageContent] })
  client.login(token)

  const bot = mineflayer.createBot({
    username: "iefn29fing98n3@outlook.com",
    password: "9Bf$qBk^^yu#NGVn3q2i8a^q3f$hKA",
    auth: 'microsoft',
    host: 'play.fennet.rentals',
    port: 25618,
    version: '1.19.3'
  })

  client.once('ready', (c) => {
    console.log(`Discord bot logged in as ${c.user.tag}`)
    channel = client.channels.cache.get(channel)
    if (!channel) {
      console.log(`I could not find the channel`)
      process.exit(1)
    }
  })

  bot.on('chat', (username, message) => {
    if(username !== bot.username){
      const messageEmbed = new EmbedBuilder()
      .setColor(0x0099FF)
      .setTitle("New Message")
      .setDescription(`[${username}] ${message}`)
      .setTimestamp()
  
      channel.send({ embeds: [messageEmbed] }); 
    }
  })

  bot._client.on('playerChat', (data) => {
    const senderNameObj = JSON.parse(data.senderName);
    const senderName = senderNameObj.text;

    if(data.plainMessage === "*cat"){
      sayCatFact();
    }
    if(data.plainMessage === "*fact"){
      sayUselessFact();
    }

    const messageEmbed = new EmbedBuilder()
    .setColor(0x0099FF)
    .setAuthor({ name: senderName, iconURL: `https://mc-heads.net/avatar/${senderName}/`, url: `https://namemc.com/${senderName}` })
    .setDescription(data.plainMessage)
    .setTimestamp()

    channel.send({ embeds: [messageEmbed] });
  });

  client.on('messageCreate', (message) => {
    if (message.channel.id !== channel.id) return
    if (message.author.id === client.user.id) return
    bot._client.chat(`${message.author.username}#${message.author.discriminator}: ${message.content}`)
  })

  bot.on('nonSpokenChat', (message) => {
    console.log(`Non spoken chat: ${message}`)
  })

  bot.on('action', (username, message) => {
    console.log(`${username} ${message}`);
  });

  bot.on('whisper', (message) => {
    console.log(`Whisper: ${message}`)
  })

  function sayUselessFact(){
    try {
      https.get('https://uselessfacts.jsph.pl/api/v2/facts/random', (res) => {
        if (res.statusCode !== 200) {
          bot._client.chat("Sorry, I Failed to fetch the information from the API :(")
        }else{
          let data = '';
          
          // Do cool stuffs 

          res.on('data', (chunk) => {
            data += chunk;
          });
          
          res.on('end', () => {
            const fact = JSON.parse(data).text;
            bot._client.chat(fact) // MEOW
          });
        }
      }).on('error', (err) => {
        console.error('Error:', err.message);
      });
    } catch (error) {
      console.error(error.message);
    }
  }

  function sayCatFact () {
    try {
      https.get('https://catfact.ninja/fact', (res) => { //Getting a little silly wid it >:3
        if (res.statusCode !== 200) {
          bot._client.chat("Sorry, I Failed to fetch the information from the API :(") // Cry to chat
        }else{
          let data = '';
          
          // Do cool stuffs 

          res.on('data', (chunk) => {
            data += chunk;
          });
          
          res.on('end', () => {
            const fact = JSON.parse(data).fact;
            bot._client.chat(fact) // MEOW
          });
        }
      }).on('error', (err) => {
        console.error('Error:', err.message);
      });
    } catch (error) {
      console.error(error.message);
    }
  }

  bot.on('spawn', () => {
      console.log(bot._client.profileKeys)
      console.log(bot._client.cipher)

      bot._client._session = {
        index: 0,
        uuid: uuid.v4fast()
      }

      bot._client.write('session', {
        sessionUUID: bot._client._session.uuid,
        expireTime: bot._client.profileKeys ? BigInt(bot._client.profileKeys.expiresOn.getTime()) : undefined,
        publicKey: bot._client.profileKeys ? bot._client.profileKeys.public.export({ type: 'spki', format: 'der' }) : undefined,
        signature: bot._client.profileKeys ? bot._client.profileKeys.signatureV2 : undefined
      })

      console.log("Trans rights!! (I spawned btw hehe) >w<")
  })

  // // Log errors and kick reasons:
  bot.on('kicked', console.log)
  bot.on('error', console.log)
  bot.on('end', createBot)
}


createBot()
////////////////////////////
//////CONFIG LOAD///////////
////////////////////////////
const { canModifyQueue } = require("../util/nkm");
const { play } = require("../include/play");
const { attentionembed } = require("../util/attentionembed");
const { MessageEmbed } = require("discord.js");
const Discord = require("discord.js");
const {
  approveemoji,
  denyemoji,
  PREFIX
} = require(`../config.json`);
//all radio stations
const Radiostations = [
  "Radio1 https://live.radio1.si/Radio1",
  "RadioCenter http://stream3.radiocenter.si:8000/;center/1",
  "RadioAntena https://live.radio.si/Antena",
  "RadioAktual https://live.radio.si/Aktual",
  "RadioVeseljak https://live.radio.si/Veseljak"
]
////////////////////////////
//////COMMAND BEGIN/////////
////////////////////////////
module.exports = {
  name: "radio",
  description: "Play a Radiostation",
  cooldown: 3,
  edesc: `Type this command to play a radio live stream!\nUsage: ${PREFIX}radio <1-34>`,
  async execute(message, args, client) {
    //define the No args Embed, lmao
    let resultsEmbed = new Discord.MessageEmbed()
      .setTitle(`**Available Radio Stations**`)//
      .addFields(
        {
          name: `***:radio: Slovenia Radio***`, value: `**1:  ** [\`${Radiostations[1 - 1].split(" ")[0]}\`](${Radiostations[1 - 1].split(" ")[1]})
        **2:  ** [\`${Radiostations[2 - 1].split(" ")[0]}\`](${Radiostations[2 - 1].split(" ")[1]})
        **3:  ** [\`${Radiostations[3 - 1].split(" ")[0]}\`](${Radiostations[3 - 1].split(" ")[1]})
        **4:  ** [\`${Radiostations[4 - 1].split(" ")[0]}\`](${Radiostations[4 - 1].split(" ")[1]})
        **5:  ** [\`${Radiostations[5 - 1].split(" ")[0]}\`](${Radiostations[5 - 1].split(" ")[1]})
        ` , inline: true
        },
      )
      .setColor("#FD305C")
      .setFooter(`Type: ${PREFIX}radio <1-5>`, client.user.displayAvatarURL())
      .setTimestamp();
    //if not guild send this
    if (!message.guild)
      return message.channel.send(resultsEmbed);
    //if no args
    if (args[0] == null) {
      return message.channel.send(resultsEmbed);
    }
      const { channel } = message.member.voice;
    //get the serverQueue
    const serverQueue = message.client.queue.get(message.guild.id);
    //if not a valid channel
    if (!channel) return attentionembed(message, "Please join a Voice Channel first");
    //react with emoji
    message.react(approveemoji);
    //If not in the same channel return error
    if (serverQueue && channel !== message.guild.me.voice.channel)
      return attentionembed(message, `You must be in the same Voice Channel as me`);
    //check permissions
    const permissions = channel.permissionsFor(message.client.user);
    if (!permissions.has("CONNECT"))
      return attentionembed(message, "I need permissions to join your channel!");
    if (!permissions.has("SPEAK"))
      return attentionembed(message, "I need permissions to speak in your channel");
    //If not a number return
    if (isNaN(args[0])) {
      channel.leave();
      return message.reply(
        new MessageEmbed()
          .setColor("#FD305C")
          .setTitle(`Not a valid radio station please use a Number between \`1\` and \`${Radiostations.length}\``)
      );
    }

    let i;

    //get which radio station
    for (i = 1; i <= 1 + Radiostations.length; i++) {

      if (Number(args[0]) === Number(i)) {
        break;
      }
    }
    //if number to big
    if (Number(i) === 35) {
      channel.leave();
      return message.reply(new MessageEmbed()
        .setColor("#FD305C")
        .setTitle(`Not a valid radio station please use a Number between \`1\` and \`${Radiostations.length}\``));
    }
    //define the Radio Args like title and url
    const args2 = Radiostations[i - 1].split(` `);
    //song infos
    const song = {
      title: args2[0],
      url: args2[1],
      thumbnail: "https://cdn.discordapp.com/attachments/754374425041961000/930191857051381790/ezgif.com-gif-maker_1.gif",
      duration: 10000,
    };
    let a, b;
    if (!serverQueue) {
      a = [];
      b = 0;
    } else {
      a = serverQueue.filters;
      b = serverQueue.realseek;
    }
    //change volume to 25
    const queueConstruct = {
      textChannel: message.channel,
      channel,
      connection: null,
      songs: [],
      loop: false,
      volume: 25,
      filters: a,
      realseek: b,
      playing: true
    };
    //try to join the Channel
    queueConstruct.connection = await channel.join().catch(console.error);
    //Send info message for joining 
    if (!serverQueue)
      message.channel.send(new MessageEmbed().setColor("#FD305C")
        .setDescription(`**👍 Joined \`${channel.name}\` 📄 bouned \`#${message.channel.name}\`**`)
        .setFooter(`${message.author.username}#${message.author.discriminator}`));
    //send Search something embed
    message.channel.send(new MessageEmbed().setColor("#FD305C")
      .setDescription(`**:radio: Searching 🔍 \`${Radiostations[i - 1].split(" ")[0]}\`**`));
    //mute yourself
    await queueConstruct.connection.voice.setSelfDeaf(true);
    await queueConstruct.connection.voice.setDeaf(true);
    /*
    //if something is playing then end everthing
    if (serverQueue) 
      serverQueue.songs = [];
    */
    //if something is playing add send this message
    if (serverQueue) {
      //Calculate the estimated Time
      let estimatedtime = Number(0);
      for (let i = 0; i < serverQueue.songs.length; i++) {
        estimatedtime += Number(serverQueue.songs[i].duration);
      }
      if (estimatedtime > 60) {
        estimatedtime = Math.round(estimatedtime / 60 * 100) / 100;
        estimatedtime = estimatedtime + " Minutes"
      }
      else if (estimatedtime > 60) {
        estimatedtime = Math.round(estimatedtime / 60 * 100) / 100;
        estimatedtime = estimatedtime + " Hours"
      }
      else {
        estimatedtime = estimatedtime + " Seconds"
      }
      //Push the ServerQueue
      serverQueue.songs.push(song);
      //the new song embed
      const newsong = new MessageEmbed()
        .setTitle(":notes:" + song.title)
        .setColor("#FD305C")
        .setThumbnail(song.thumbnail)
        .setURL(song.url)
        .setDescription(`\`\`\`Has been added to the Queue.\`\`\``)
        .addField("Estimated time until playing:", `\`${estimatedtime}\``, true)
        .addField("Position in queue", `**\`${serverQueue.songs.length - 1}\`**`, true)
        .setFooter(`Requested by: ${message.author.username}#${message.author.discriminator}`, message.member.user.displayAvatarURL({ dynamic: true }))
      //send the Embed into the Queue Channel
      return serverQueue.textChannel
        .send(newsong)
        .catch(console.error);

    }
    //add it to the Queue
    queueConstruct.songs.push(song);
    //set the Server Queue
    message.client.queue.set(message.guild.id, queueConstruct);

    try {
      play(queueConstruct.songs[0], message, client);
    } catch (error) {
      console.error(error);
      message.client.queue.delete(message.guild.id);
      await channel.leave();
      return message.channel.send(`Could not join the channel: ${error}`).catch(console.error);
    }
    //sende bestätigung
  }
};

const { MessageEmbed } = require("discord.js");

module.exports = {
  name: "invite",
  aliases: ["inv"],
  description: "Invite the bot to your server.",
  execute(message) {

    let inviteEmbed = new MessageEmbed()
      .setTitle("Add us to your server!")
      .setDescription("Love using Matimajka? Great, Thank you! Consider adding it to your server")
      .setColor("#FD305C")
      .setAuthor('TheCRIB','https://cdn.discordapp.com/attachments/754374425041961000/930191857051381790/ezgif.com-gif-maker_1.gif')
      .setThumbnail(message.guild.iconURL())
      .addField(`Use the following link to add MatiMajka to your discord server`, 'https://discord.com/api/oauth2/authorize?client_id=930184218766606386&permissions=8&scope=bot', true)

    inviteEmbed.setTimestamp();

    return message.channel.send(inviteEmbed).catch(console.error);
  }
};
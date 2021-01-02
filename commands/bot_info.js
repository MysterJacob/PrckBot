const discord = require('discord.js');

module.exports.run = function(client , msg, args,config,database_connection) {
    const richembed = new discord.MessageEmbed();
    richembed.setTitle('Bot działa i wyszystko jest ok!');
    richembed.setColor('d68711');
    richembed.image = './Logo_bot.png';
    richembed.setThumbnail('https://cdn.discordapp.com/avatars/678333647568502825/d5940fd9d850e896d1d36cbb254ccb73.webp');
    richembed.addFields(
        { name:'Nazwa bota na serwerze', value:client .user.username },
        { name:'Twórca', value:'Myster' },
        { name:'Data dołączenia' ,value:msg.guild.joinedAt },
        { name:'Przeznaczenie', value:'Dla SCP:Minefundation' },
    );
    richembed.setFooter(':)','https://cdn.discordapp.com/avatars/330768055468818435/304251572676d2a89cb91dcfc0d848da.webp');
    // richembed.attachFiles('./Logo_bot.png');
    msg.channel.send(richembed);
};

module.exports.config = {
    name:'botinfo',
    alias:[],
    usage:'botinfo',
    descripton:'Wyświetla informacje o bocie',
    premissionLevel:0,
    // 0-Everyone 1-Mods 2-Admins 3-Mods 4-Owner 6-Bot owner
    runtype:0,
    // 0-Everywhere 1-Only servers 2-Only dms
    accurate_descripton:'Wyświetla dokładne informacje o bocie, takie jak data dołączenia,twórca, cel itp.',
};

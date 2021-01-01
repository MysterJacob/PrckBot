const discord = require('discord.js');

module.exports.run = function(client , msg, args,config,database_connection) {
    msg.reply('Serwer jest wyłączony :(');
};

module.exports.config = {
    name:'serverInfo',
    alias:[],
    usage:'serverInfo',
    descripton:'Wyświetla informacje o serwerze minecraft',
    premissionLevel:0,
    // 0-Everyone 1-Mods 2-Admins 3-Owner 4-Bot owner
    runtype:0,
    // 0-Everywhere 1-Only servers 2-Only dms
    accurate_descripton:'Wyświetla dokładne informacje o serwerze SCP:MineFundation, takie jak status serwera,ilości graczy itp. ',
};

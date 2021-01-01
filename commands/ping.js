const discord = require('discord.js');

module.exports.run = function(client , msg, args,config,database_connection) {
    msg.reply('Pong :)');
};

module.exports.config = {
    name:'ping',
    alias:[],
    usage:'ping',
    descripton:'Pong :)',
    premissionLevel:4,
    // 0-Everyone 1-Mods 2-Admins 3-Owner 4-Bot owner 5-No one ?
    runtype:0,
    // 0-Everywhere 1-Only servers 2-Only dms
    accurate_descripton:'Prosta komenda sprawdzająca czy bot odpowiada',
};

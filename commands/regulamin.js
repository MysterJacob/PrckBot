const discord = require('discord.js');
const { Console } = require('console');
const fs = require('fs');
const regultaions = JSON.parse(fs.readFileSync('./regulations.json'));

module.exports.run = function(client , msg, args,config,database_connection) {
    module.exports.sendDcReg(msg);
    module.exports.sendMcReg(msg);
};
module.exports.sendDcReg = function(msg) {
    const regEmbed = new discord.MessageEmbed();
    //  regEmbed.setAuthor('Regulamin serwera');
    const reg = regultaions.discord;
    const reg_points = reg.points;
    for(let i = 0; i < reg_points.length;i++) {
        const c_point = reg_points[i];
        regEmbed.addField(c_point.name,c_point.desc);
    }

    regEmbed.setTitle(reg.title);
    regEmbed.setDescription(reg.description);
    regEmbed.setColor(reg.color);
    regEmbed.setThumbnail(reg.image);
    regEmbed.setFooter(reg.footer);
    msg.channel.send(regEmbed);
};
module.exports.sendMcReg = function(msg) {
    const regEmbed = new discord.MessageEmbed();
    //  regEmbed.setAuthor('Regulamin serwera');
    const reg = regultaions.minecraft;
    const reg_points = reg.points;
    for(let i = 0; i < reg_points.length;i++) {
        const c_point = reg_points[i];
        regEmbed.addField(c_point.name,c_point.desc);
    }

    regEmbed.setTitle(reg.title);
    regEmbed.setDescription(reg.description);
    regEmbed.setColor(reg.color);
    regEmbed.setThumbnail(reg.image);
    regEmbed.setFooter(reg.footer);
    msg.channel.send(regEmbed);
};
module.exports.config = {
    name:'regulamin',
    alias:['reg'],
    usage:'regulamin',
    descripton:'Komenda, która służy wyświetlania requlaminu',
    premissionLevel:0,
    // 0-Everyone 1-Mods 2-Admins 3-Owner 4-Bot owner
    runtype:0,
    // 0-Everywhere 1-Only servers 2-Only dms
    accurate_descripton:'Komenda, która służy wyświetlania requlaminu',
};
const discord = require('discord.js');


module.exports.run = function(client , msg, args,config,database_connection) {
    const authon_id = msg.author.id;
    const query = 'SELECT * FROM users WHERE DiscordID="' + authon_id.toString() + '";';
    database_connection.query(query,(err,result,tables)=>{
        if(err) {
            msg.reply('Niestety wystąpiły problemy z połączeniem z naszą bazą danych,ponów próbę później');
            console.log(err);
            return;
        }


        if(result.length <= 0) {
            msg.reply('Nie moge znaleść cię w naszej bazie danych, prawdopodobnie nie przypisałeś konta discord do konta minecraft!');
            return;
        }

        // ID 	DiscordTag 	DiscordID MinecraftNickname 	MinecraftUUID 	UniqueKey 	DateOfFirstJoin 	DateOfLastJoin 	IsOnline 	Badage 	PlaceInRanking  ExperiencePoints Level
        const db_table = JSON.parse(JSON.stringify(result))[0];

        const db_id = db_table.ID;
        const db_DiscordTag = db_table.DiscordTag;
        const db_DiscordID = db_table.DiscordID;
        const db_MinecraftNickname = db_table.MinecraftNickname;
        const db_MinecraftUUID = db_table.MinecraftUUID;
        const db_UniqueKey = db_table.UniqueKey;
        const db_DateOfFirstJoin = db_table.DateOfFirstJoin;
        const db_DateOfLastJoin = db_table.DateOfLastJoin;
        const db_IsOnline = db_table.IsOnline == 1;
        const db_Badage = db_table.Badage;
        const db_PlaceInRanking = db_table.PlaceInRanking;
        const db_Level = db_table.Level;
        const db_ExperiencePoints = db_table.ExperiencePoints;

        const embed = new discord.MessageEmbed();

        if(db_Badage) {
            embed.setTitle('[**' + db_Badage + '**] ' + db_MinecraftNickname);
        }else{
            embed.setTitle(db_MinecraftNickname);
        }


        embed.setAuthor('Dane i statystyki gracza ');
        embed.setColor(db_IsOnline ? '#02cc10' : 'bf0000');
        embed.setDescription('Obecny status ' + (db_IsOnline ? ':green_circle:Online' : ':red_circle:Offline'));
        embed.addField('Ostatni raz na serwerze',db_DateOfLastJoin.slice(0,db_DateOfLastJoin.length - 5).replace('T',' | '),true);
        embed.addField('Pierwszy raz na serwerze',db_DateOfFirstJoin.slice(0,db_DateOfLastJoin.length - 5).replace('T',' | '),true);
        let progressbar = '|' + calcluateExpNeededForLevel(db_Level - 1).toString() + '|';
        const progressbarsize = 25;
        const expatthislevel = db_ExperiencePoints - calcluateExpNeededForLevel(db_Level - 1);
        const playerprogress = expatthislevel / calcluateExpNeededForLevel(db_Level);
        for(let i = 0 ;i < progressbarsize;i++) {
            const progressbarprogress = i / progressbarsize;
            progressbar += ((playerprogress > progressbarprogress) ? '=' : '-');
        }


        progressbar += '|' + calcluateExpNeededForLevel(db_Level).toString() + '|' + (Math.round(playerprogress * 1000) / 10).toString() + '%';
        embed.addField('Masz poziom ' + db_Level.toString(),progressbar);
        embed.setFooter('Zaktualizowano ');
        embed.setTimestamp(db_DateOfLastJoin);
        msg.channel.send(embed);

    });
};
function clamp(value) {
    if(value < 0) return 0;
    return value;
}
function calcluateExpNeededForLevel(level) {
    if(level < 0) {
        return 0;
    }
    return 400 + (level * 632) + (level * level) * 2;
}
module.exports.config = {
    name:'rank',
    alias:['rk'],
    usage:'rank',
    descripton:'Wyświetla twoje statystyki',
    premissionLevel:0,
    // 0-Everyone 1-Mods 2-Admins 3-Owner 4-Bot owner
    runtype:0,
    // 0-Everywhere 1-Only servers 2-Only dms
    accurate_descripton:'Komenda służy do sprawdzania twojch statystyk na naszym serwera minecraft',
};

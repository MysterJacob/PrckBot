const discord = require('discord.js');
const { Console } = require('console');
const { StringDecoder } = require('string_decoder');
const { readSync } = require('fs');
const { exit } = require('process');
const fs = require('fs');
const { request } = require('http');
module.exports.run = function(client , msg, args,config,database_connection) {
    // ID 	DiscordTag 	DiscordID MinecraftNickname 	MinecraftUUID 	UniqueKey 	DateOfFirstJoin 	DateOfLastJoin 	IsOnline 	Badage 	PlaceInRanking  ExperiencePoints Level
    {
        const find_querry = 'SELECT ID FROM users WHERE DiscordID  ="' + msg.author.id + '";';
        database_connection.query(find_querry,(err, result, fields)=> {
            if(!result || result.length <= 0) {
                return msg.reply('Komenda jest dostępna tylko dla zweryfikowanych użytkowników.....');
            }
        });
    }
    const hasIllegarChars = function(string) {
        const illegalChars = ['\'','"','-','[',']','{','}','%','&',';'];
        for(let i = 0 ; i < illegalChars.length ; i++) {
            if(string.indexOf(illegalChars[i]) > -1) {
                return true;
            }
        }
        return false;
    };

    const channel = msg.channel;
    {
        const filter = response => {
            return response.author.id == msg.author.id;
        };
        channel.send('```Prosze podaj nick gracza, którego chcesz zgłosić...```  \r\t Nie używaj znaków specjalnych, bardzo ich nie lubie.').then(()=>{
            msg.channel.awaitMessages(filter, { max: 1, time: 30000, errors: ['time'] })
                .then(collected => {
                    askfornickname(collected.first());
                })
                .catch(err => {
                    if(err.length <= 0) {
                        msg.channel.send('Brak oczekiwanej odpowiedzi :(');
                    }else{
                        msg.channel.send('Wystąpił nieoczekiwany błąd');
                        console.log(err);
                    }
                });
        });
    }

    let db_id;
    let db_DiscordTag;
    let db_DiscordID;
    let db_MinecraftNickname;
    let db_MinecraftUUID;
    let db_UniqueKey;
    let db_DateOfFirstJoin;
    let db_DateOfLastJoin;
    let db_IsOnline;
    let db_Badage;
    let db_PlaceInRanking;
    let db_Level;
    let db_ExperiencePoints;

    let regulaminBreakpoint;
    let reason;

    let db_authorID;

    async function askfornickname(rmsg) {
        if(!hasIllegarChars(rmsg.content)) {

            const find_querry = 'SELECT ID,DiscordTag,MinecraftNickname,IsOnline FROM users WHERE DiscordTag LIKE "' + rmsg.content + '%" OR MinecraftNickname LIKE "%' + rmsg.content + '%";';

            database_connection.query(find_querry,(err, result, fields)=> {

                if(err) {
                    return channel.send('Przepraszamy ale mamy problemy z bazą danych, proszę spróbować ponownie później...');
                }

                if(result && result.length > 0) {

                    const result_embed = new discord.MessageEmbed();
                    if(result.length == 1) {
                        const c_result = result[0];
                        result_embed.addField('Nazwa w minecraft',c_result.MinecraftNickname,true);
                        if(c_result.DiscordTag) {
                            result_embed.addField('Nazwa na discordzie',c_result.DiscordTag,true);
                        }
                        result_embed.addField('Status',c_result.IsOnline ? ':green_circle:Online' : ':red_circle:Offline' ,true);

                        channel.send(result_embed).then(()=>{
                            channel.send('Czy to użytkownik którego checesz zgłośić?');
                            const result_embed_message = client .user.lastMessage;
                            const reactions = ['✅','❌'];
                            for(let i = 0 ; i < 2; i++) {
                                result_embed_message.react(reactions[i]).catch(e=> {console.log(e);return -1;});
                            }

                            const filter = (reaction, user) => {
                                return reactions.includes(reaction._emoji.name) && user.id === rmsg.author.id;
                            };

                            result_embed_message.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] }).then((reaction, user)=> {
                                if(reaction.first()._emoji.name == reactions[0]) {
                                    getData(result[0].ID);
                                    askForRegulaminBreakPoint();
                                }else{
                                    channel.send('Jak nie to nie ....');
                                    return;
                                }
                            }).catch(e=> {
                                console.log(e);
                                return;
                            });
                        });
                    } else {

                        for(let i = 0 ;i < result.length; i++) {
                            const c_result = result[i];
                            result_embed.addField('*' + (i + 1).toString() + '.*Nazwa w minecraft',c_result.MinecraftNickname,true);
                            if(c_result.DiscordTag) {
                                result_embed.addField('Nazwa na discordzie',c_result.DiscordTag,true);
                            }
                            result_embed.addField('Status',c_result.IsOnline ? ':green_circle:Online' : ':red_circle:Offline' ,true);

                        }

                        channel.send(result_embed).then(()=>{
                            rmsg.channel.send('Znalezłem wielu użytkowników o podobnym nicku, prosze wybierz jednego...');
                            const result_embed_message = client .user.lastMessage;
                            const reactions = ['1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣','9️⃣'];
                            console.log(result.length);
                            for(let i = 0 ; i < result.length; i++) {
                                result_embed_message.react(reactions[i]).catch(e=> {console.log('error ');});
                            }

                            const filter = (reaction, user) => {
                                return reactions.includes(reaction.emoji.name) && user.id === rmsg.author.id;
                            };

                            result_embed_message.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] }).then((reaction, user)=> {
                                getData(result[reactions.indexOf(reaction.first()._emoji.name)].ID);
                                askForRegulaminBreakPoint();
                            }).catch(e=> {
                                console.log(e);
                                return;
                            });
                        });
                    }
                }else{
                    rmsg.reply('Nie moge znaleść użytkownika :(');
                    return;
                }
            });

        }else{
            rmsg.reply('Nick nie może zawierać znaków specjanych!');
            return;
        }

    }
    function askForRegulaminBreakPoint() {
        {
            const filter = response => {
                return response.author.id == msg.author.id;
            };
            channel.send('```Który punkt regulaminu łamie według ciebie użytkownik ? Podaj numer ```').then(()=>{
                try{
                    require('../commands/regulamin.js').sendDcReg(msg);
                }catch(e) {
                    channel.send('Chciałem ci tu wyświetlić regulamin, ale niestety nie można wczytać regulaminu :(');
                    console.log(e);
                }
                msg.channel.awaitMessages(filter, { max: 1, time: 30000, errors: ['time'] })
                    .then(collected => {
                        const reg = JSON.parse(fs.readFileSync('./regulations.json'));
                        const msgcontent = collected.first().content;
                        try{
                            if(hasIllegarChars(msgcontent)) {
                                return channel.send('To nie liczba to MySQL injection! ');
                            }
                            const input_regulaminBreakpoint = parseInt(msgcontent);
                            if(input_regulaminBreakpoint > reg.discord.points.length + 1) {
                                channel.send('Nie ma nawet takiego puntu ale niech ci będzie ...');
                            }
                            regulaminBreakpoint = input_regulaminBreakpoint;
                        }catch(e) {
                            channel.send('To nie jest nawet poprawna liczba ale ok... spoko...');
                            regulaminBreakpoint = msgcontent;
                        }
                        askForReason();
                    })
                    .catch(err => {
                        if(err.length <= 0) {
                            msg.channel.send('Brak oczekiwanej odpowiedzi :(');
                        }else{
                            msg.channel.send('Wystąpił nieoczekiwany błąd');
                            console.log(err);
                        }
                    });
            });
        }
    }
    function askForReason() {
        const filter = response => {
            return response.author.id == msg.author.id;
        };
        channel.send('```Opisz dokładnie co się stało, postaraj podać takie informacje jak godzina,nick graczy,miejsce itp...``` \r\t A i nie używaj znaków specjalnych, bardzo ich nie lubie.').then(()=>{
            msg.channel.awaitMessages(filter, { max: 1, time: 30000, errors: ['time'] })
                .then(collected => {
                    const msgcontent = collected.first().content;
                    if(hasIllegarChars(msgcontent)) {
                        return channel.send('Miałeś nie używać znaków specjalnych :angry: ');
                    }
                    reason = msgcontent;
                    askForAnonymity();
                })
                .catch(err => {
                    if(err.length <= 0) {
                        msg.channel.send('Brak oczekiwanej odpowiedzi :(');
                    }else{
                        msg.channel.send('Wystąpił nieoczekiwany błąd');
                        console.log(err);
                    }
                });
        });
    }
    function askForAnonymity() {
        const filter = response => {
            return response.author.id == msg.author.id;
        };
        channel.send('```Użytkownik ' + db_DiscordTag + ' zostanie poinformowany o ty, że został zgłoszony czy chcesz pozostać *dla niego* anonimowy?```').then(()=>{
            const result_embed_message = client .user.lastMessage;
            const reactions = ['✅','❌'];
            for(let i = 0 ; i < 2; i++) {
                result_embed_message.react(reactions[i]).catch(e=> {console.log(e);return -1;});
            }

            // eslint-disable-next-line no-shadow
            const filter = (reaction, user) => {
                return reactions.includes(reaction._emoji.name) && user.id === msg.author.id;
            };
            result_embed_message.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] }).then((reaction, user)=> {
                const reported_discord_user = client .users.fetch(db_DiscordID).user;
                console.log(reported_discord_user);
                if(reported_discord_user) {
                    if(reaction.first()._emoji.name == reactions[0]) {
                        reported_discord_user.send('Zostałeś zgłoszony przez użytkownika ||' + msg.author.username + '|| za naruszenie regulaminu!');
                    }else{
                        reported_discord_user.send('Zostałeś zgłoszony przez użytkownika ||[UTAJNIONO]|| za naruszenie regulaminu!');
                    }
                }
                displayData();
            }).catch(e=> {
                console.log(e);
                return;
            });
        });
    }
    function getData(playerID) {
        if(playerID == -1) {
            return;
        }
        try{
            const get_query = 'SELECT * FROM users WHERE ID =' + playerID.toString() + ';';
            database_connection.query(get_query,(err, result, fields)=> {
                if(err) {
                    return channel.send('Przepraszamy ale mamy problemy z bazą danych, proszę spróbować ponownie później...');
                }
                const db_table = JSON.parse(JSON.stringify(result))[0];
                db_id = db_table.ID;
                db_DiscordTag = db_table.DiscordTag;
                db_DiscordID = db_table.DiscordID;
                db_MinecraftNickname = db_table.MinecraftNickname;
                db_MinecraftUUID = db_table.MinecraftUUID;
                db_UniqueKey = db_table.UniqueKey;
                db_DateOfFirstJoin = db_table.DateOfFirstJoin;
                db_DateOfLastJoin = db_table.DateOfLastJoin;
                db_IsOnline = db_table.IsOnline == 1;
                db_Badage = db_table.Badage;
                db_PlaceInRanking = db_table.PlaceInRanking;
                db_Level = db_table.Level;
                db_ExperiencePoints = db_table.ExperiencePoints;
            });
            const find_querry = 'SELECT * FROM users WHERE DiscordID  ="' + msg.author.id + '";';
            database_connection.query(find_querry,(err, result, fields)=> {
                if(result || result.length <= 0) {
                    const db_table = JSON.parse(JSON.stringify(result))[0];
                    db_authorID = db_table.ID;
                }
            });

        }catch(e) {
            channel.send('Mam problem z bazą danych, spróbuj ponownie poźniej :[');
        }
    }
    function displayData() {
        const embed = new discord.MessageEmbed();
        embed.setAuthor('Zgłoszenie');
        embed.addField('Nazwa gracza minecraft',db_MinecraftNickname,true);
        embed.addField('Nazwa gracza disord',db_DiscordTag,true);
        embed.addField('Status',db_IsOnline ? ':green_circle:Online' : ':red_circle:Offline');
        embed.addField('Ostatni raz na serwerze',db_DateOfLastJoin.slice(0,db_DateOfLastJoin.length - 5).replace('T',' | '),true);
        embed.addField('Pierwszy raz na serwerze',db_DateOfFirstJoin.slice(0,db_DateOfLastJoin.length - 5).replace('T',' | '),true);
        embed.addField('Złamany punt regulaminu',regulaminBreakpoint);
        embed.addField('Powód zgłosenia', reason);
        channel.send(embed).then((embed_message)=>{

            channel.send('Jestes pewien, że napewno zgłosiłeś dobrego użytkownika oraz, że to nie żart, pamiętaj nie jesteś anonimowy dla administarcji!');
            const reactions = ['✅','❌'];
            for(let i = 0 ; i < 2; i++) {
                embed_message.react(reactions[i]).catch(e=> {console.log(e);return -1;});
            }

            const filter = (reaction, user) => {
                return reactions.includes(reaction._emoji.name) && user.id === msg.author.id;
            };

            embed_message.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] }).then((reaction, user)=> {
                if(reaction.first()._emoji.name == reactions[0]) {
                    let values = '(';
                    values += 'NULL,"';
                    values += db_authorID.toString() + '","';
                    values += db_id.toString() + '","';
                    values += regulaminBreakpoint.toString() + '","';
                    values += reason.toString() + '","';
                    const date = new Date();
                    values += date.toISOString() + '","';
                    values += '0","';
                    values += '0"';
                    values += ')';
                    const inser_query = 'INSERT INTO reports (ID,AuthorID,ReportedID,RegPointBroken,Reason,DateOfReport,Archival,Status) VALUES ' + values + ';';

                    database_connection.query(inser_query,(err, result, fields)=> {
                        console.log(err);
                        if(err) {
                            return channel.send('Problemy z bazą danych :{');
                        }else{
                            return channel.send('Zgłoszenie przyjęte :)');
                        }
                    });
                }else{
                    channel.send('Wróc jak będziesz pewien...');
                    return;
                }
            }).catch(e=> {
                console.log(e);
                return;
            });
        });
    }

};

module.exports.config = {
    name:'report',
    alias:['rp'],
    usage:'report [nazwa użytkowinika] [powód]',
    descripton:'Komenda, która służy do zgłaszania użytkowników naszego serwera miecraft',
    premissionLevel:0,
    // 0-Everyone 1-Mods 2-Admins 3-Owner 4-Bot owner
    runtype:2,
    // 0-Everywhere 1-Only servers 2-Only dms
    accurate_descripton:'Zgłasza użytkownika, może zostać użyta tylko w bezpośrediniej konwersacji z botem',
};

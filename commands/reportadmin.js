const discord = require('discord.js');

const setDisplayedReport = function(msg,report_embed,curentReport,database_connection) {
    console.log(curentReport);
    const get_query = 'SELECT * FROM reports ORDER BY DateOfReport ASC';
    const channel = msg.channel;
    database_connection.query(get_query,(err, result, fields)=> {
        if(err) {
            return channel.send('Problemy z bazą danych :{');
        }else{
            const reports = JSON.parse(JSON.stringify(result));

            const db_report_data = reports[curentReport];
            const author_get_querry = 'SELECT * FROM users WHERE ID = "' + db_report_data.AuthorID.toString() + '" LIMIT 1;';
            const reported_get_querry = 'SELECT * FROM users WHERE ID = "' + db_report_data.ReportedID.toString() + ' LIMIT 1";';

            database_connection.query(author_get_querry,(author_err,author_result,author_fields)=>{
                database_connection.query(reported_get_querry,(reported_err,reported_result,reported_fields)=> {
                    const reported_json_result = JSON.parse(JSON.stringify(reported_result))[0];
                    if(author_err || reported_err) {
                        return channel.send('Problemy z bazą danych, przepraszamy :p');
                    }

                    const embed = new discord.MessageEmbed();
                    embed.setTitle('Zgłoszenie nr. ' + db_report_data.ID.toString());
                    embed.setColor('#3483eb');
                    embed.setTimestamp(db_report_data.DateOfReport);
                    embed.addField('Nazwa zgłoszonego(Minecraft)', reported_json_result.MinecraftNickname,true);
                    embed.addField('Nazwa zgłoszonego(Discord)', reported_json_result.DiscordTag ? reported_json_result.DiscordTag : 'Brak danych');

                    embed.addField('Nazwa zgłaszającego(Minecraft)', reported_json_result.MinecraftNickname,true);
                    embed.addField('Nazwa zgłaszającego(Discord)', reported_json_result.DiscordTag,true);

                    embed.addField('Złamany punkt regulaminu',reported_json_result.RegPointBroken ? reported_json_result.RegPointBroken : 'Podano nie prawidłowy punkt');
                    embed.addField('Powód',db_report_data.Reason);
                    if(!report_embed) {
                        channel.send(embed).then((msg_embed)=>{
                            report_embed = msg_embed;
                            const reactions = ['⬅','✅','❌','🗃','🗑','➡'];
                            for(let i = 0; i <= reactions.length; i++) {
                                report_embed.react(reactions[i]).catch(e=> {
                                    console.log(e);
                                });
                            }
                            const filter = (reaction, user) => {
                                console.log(reaction._emoji.name);
                                return reactions.includes(reaction._emoji.name) && user.id === msg.author.id;
                            };
                            console.log(report_embed);
                            report_embed.awaitReactions(filter,{ max:3000, time: 60000, errors: ['time'] }).then((reaction, user)=> {
                                console.log(reaction.first()._emoji.name);
                                switch(reaction.first()._emoji.name) {
                                case reactions[0]:
                                    if(curentReport == 0) {
                                        curentReport = reports.length - 1;
                                    }else {
                                        curentReport--;
                                    }
                                    setDisplayedReport(curentReport);
                                    break;
                                case reactions[reactions.length - 1]:
                                    if(curentReport == reports.length - 1) {
                                        curentReport = 0;
                                    }else {
                                        curentReport++;
                                    }
                                    setDisplayedReport(curentReport);
                                    break;
                                }
                            }).catch(e=>{
                                console.log(e);
                            });
                        });
                    }else {
                        report_embed.edit(embed);
                    }
                });
            });
            return report_embed;
        }
    });

};

module.exports.run = function(client , msg, args,config,database_connection) {
    setDisplayedReport(msg,null,0,database_connection);
};

module.exports.config = {
    name:'reportadmin',
    alias:['rd'],
    usage:'reportadmin',
    descripton:'Wyświetla zgłoszenia użytkowników',
    premissionLevel:3,
    // 0-Everyone 1-Mods 2-Admins 3-Owner 4-Bot owner
    runtype:0,
    // 0-Everywhere 1-Only servers 2-Only dms
    accurate_descripton:'Pokazuje liste zgłoszeń',
};

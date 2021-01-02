const discord = require('discord.js');

const setDisplayedReport = function(msg,embedMessage,curentReport,database_connection) {
    const get_query = 'SELECT * FROM reports WHERE Archival = 0 ORDER BY DateOfReport ASC';
    const channel = msg.channel;
    database_connection.query(get_query,(err, result, fields)=> {

        if(err) {
            return channel.send('Problemy z bazą danych :{');
        }else{
            const reports = JSON.parse(JSON.stringify(result));

            if(reports.length <=0){
                return msg.reply("Cała robota wykonana, nie ma już więcej zgłoszeń :)")
            }
            //Queries
            const db_report_data = reports[curentReport];
            
            const author_get_querry = 'SELECT * FROM users WHERE ID = "' + db_report_data.AuthorID.toString() + '" LIMIT 1;';
            const reported_get_querry = 'SELECT * FROM users WHERE ID = "' + db_report_data.ReportedID.toString() + ' LIMIT 1";';

                
            database_connection.query(reported_get_querry,async (reported_err,reported_result,reported_fields)=> {
                    database_connection.query(author_get_querry,async (reporting_err,reporting_result,reporting_fields)=> {
                        const reported_json_result = JSON.parse(JSON.stringify(reported_result))[0];
                        const reporting_json_result = JSON.parse(JSON.stringify(reporting_result))[0];
                        if(reported_err) {
                            return channel.send('Problemy z bazą danych, przepraszamy :p');
                        }
                        
                        //Prepare embed
                        const statuses = ["W trakcie","Przyjęty","Anulowany"]
                        const embed = new discord.MessageEmbed();
                        embed.setTitle('Zgłoszenie nr. ' + db_report_data.ID.toString()+" [**"+statuses[db_report_data.Status]+"**]");
                        embed.setColor('#3483eb');
                        embed.setTimestamp(db_report_data.DateOfReport);
                        embed.addField('Nazwa zgłoszonego(Minecraft)', reported_json_result.MinecraftNickname,true);
                        embed.addField('Nazwa zgłoszonego(Discord)', reported_json_result.DiscordTag ? reported_json_result.DiscordTag : 'Brak danych');

                        embed.addField('Nazwa zgłaszającego(Minecraft)', reporting_json_result.MinecraftNickname,true);
                        embed.addField('Nazwa zgłaszającego(Discord)', reporting_json_result.DiscordTag,true);

                        embed.addField('Złamany punkt regulaminu',db_report_data.RegPointBroken ? db_report_data.RegPointBroken : 'Podano nie prawidłowy punkt');
                        embed.addField('Powód',db_report_data.Reason);

                       

                        const reactions = ['⬅','✅','❌','🗃','➡'];
                        //First embed
                        if(!embedMessage) {
                            //Send embed
                            const sentEmbed = await channel.send(embed)
                            embedMessage = sentEmbed;
                            //Adding reactions
                            for(let i = 0; i < reactions.length; i++) {
                                await embedMessage.react(reactions[i]).catch(e=> {
                                });
                            }
                            //Wait for reactions
                        }else {
                            //Just edit 
                            embedMessage.edit(embed);
                        }



                        embedMessage.awaitReactions((reaction, user) =>user.id == msg.author.id,{ max: 1, time: 30000 }).then(reacted=>{
                            const reaction = reacted.first()._emoji.name
                            switch(reaction) {
                                    //Next report
                                case reactions[0]:
                                    if(curentReport == 0) {
                                        curentReport = reports.length - 1;
                                    }else {
                                        curentReport--;
                                    }
                                    setDisplayedReport(msg,embedMessage,curentReport,database_connection);
                                    break;
                                    //Last report
                                case reactions[1]:
                                        const accept_query = "UPDATE reports SET Status = '1' WHERE ID='"+db_report_data.ID+"';"
                                        database_connection.query(accept_query,(err,res)=>{});
                                        setDisplayedReport(msg,embedMessage,curentReport,database_connection);
                                    break;
                                case reactions[2]:
                                        const decline_query = "UPDATE reports SET Status = '2' WHERE ID='"+db_report_data.ID+"';"
                                        database_connection.query(decline_query,(err,res)=>{});
                                        setDisplayedReport(msg,embedMessage,curentReport,database_connection);
                                    break;
                                case reactions[3]:
                                        const archive_query = "UPDATE reports SET Archival = '1' WHERE ID='"+db_report_data.ID+"';"
                                        console.log(archive_query);
                                        database_connection.query(archive_query,(err,res)=>{});
                                        setDisplayedReport(msg,embedMessage,0,database_connection);
                                    break;
                                case reactions[reactions.length - 1]:
                                    if(curentReport == reports.length - 1) {
                                        curentReport = 0;
                                    }else {
                                        curentReport++;
                                    }
                                    setDisplayedReport(msg,embedMessage,curentReport,database_connection);
                                    break;
                            }
                        }).catch(e=>{
                            throw e
                        });
                });
            });
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
    // 0-Everyone 1-Mods 2-Admins 3-Mods 4-Owner 6-Bot owner
    runtype:0,
    // 0-Everywhere 1-Only servers 2-Only dms
    accurate_descripton:'Pokazuje liste zgłoszeń',
};

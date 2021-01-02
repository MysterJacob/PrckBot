const discord = require('discord.js');
const client = new discord.Client({ disableEveryone: true });
const fs = require('fs');
const crypto = require('crypto');

const config = JSON.parse(fs.readFileSync('config.json'));

const encryptedtoken = config.token;
const token = new Buffer.from(encryptedtoken, 'base64').toString('ascii');

const prefix = config.prefix;

const mysql = require('mysql');

const encryptedpassword = config.data_base_password;
const password = new Buffer(encryptedpassword,'base64').toString('ascii');
const connectionToDataBase = mysql.createConnection({
    host: config.data_base_host,
    user: config.data_base_user,
    password: password,
    database: config.data_base_name,
});


connectionToDataBase.connect(function(err) {
    if (err) throw err;
});
function changeUserdata(user,dataname,data) {
    const user_data = JSON.parse(fs.readFileSync('users_data.json'));
    if(!user_data[user.id]) {
        user_data[user.id] = {};
    }
    if(!user_data[user.id][dataname]) {
        user_data[user.id][dataname] = '';
    }
    user_data[user.id][dataname] = data;
    fs.writeFileSync('users_data.json',JSON.stringify(user_data));
}

function getUserdata(user,dataname) {
    const user_data = JSON.parse(fs.readFileSync('users_data.json'));
    try{
        return user_data[user.id][dataname];
    }catch(e) {
        return null;
    }
}


client .commands = new discord.Collection();


client .once('ready', ()=>{
    fs.readdir('commands', (err, files) =>{

        files = files.filter(f=>f.split('.').pop() === 'js');
        if(files.length <= 0) {
            console.error('Could not find commands!');
            return;
        }
        files.forEach((f, i)=>{
            const file_name = f;
            const command_name = file_name.split('.')[0];
            console.log('Loading module:', command_name);
            const command = require('./commands/' + f);
            client .commands.set(command.config.name.toLowerCase(), command);
            console.log('Loaded module:', command_name);
        });


    });
    console.log('Bot jest gotowy!');
});

function check_pair_secret(author,msg) {
    const content = msg.content.substring(2,msg.content.length);
    if(content.length != 32) {
        msg.reply('To nie jest prawidłowy klucz weryfikacji! Klucz powinnien mieć 32 litery.');
        return;
    }


    //  ------------------VERYFI------------------
    const hash = crypto.createHash('sha256').update(content).digest('hex');
    const query = 'SELECT * FROM users WHERE UniqueKey="' + hash.replace(' ','') + '";';
    // const query = 'SELECT * FROM users;';
    msg.channel.send('Sprawdzanie klucza weryfikacji ...').then((e_msg)=>{
        connectionToDataBase.query(query,(err, result, fields)=> {
            if(result) {
                const table_json = JSON.parse(JSON.stringify(result))[0];
                const c_discord_id = table_json.DiscordID;
                if(!c_discord_id) {
                    const minecraft_nickname = table_json.MinecraftNickname;
                    const update_query = 'UPDATE users SET DiscordTag ="' + author.tag.toString() + '",DiscordID="' + author.id.toString() + '" WHERE UniqueKey="' + hash + '";';
                    connectionToDataBase.query(update_query,(update_err, update_result, update_fields)=> {
                        if(err != null) {
                            e_msg.edit('Błąd podczas przypisywania użytkownika!');
                            return;
                        }else{
                            e_msg.edit('Klucz został zweryfkikowany, zostałeś przypisany do konta ' + minecraft_nickname + '\r\t \
                            Masz teraz dostęp do komend:\r\t\
                                1.Stats\r\t\
                                2.serverInfo\r\t\
                                3.Report\r\t\
                            Baw się dobrze :)');
                        }
                        return;
                    });

                }else if((c_discord_id == author.id)) {
                    e_msg.edit('Twoje konto jest już przypisane!');
                    return;
                }
            }
            let readeddata = getUserdata(author,'unsuccessful_pair_tries');
            if(readeddata == null) {
                readeddata = 0;
            }else {
                readeddata = parseInt(readeddata);
            }
            changeUserdata(author,'unsuccessful_pair_tries',readeddata + 1);
            if(readeddata >= 5) {
                e_msg.edit('Wykorzystałeś wszystkie próby,w celu ponownej weryfikacji skontaktuj się z administratorem');
            }else{
                e_msg.edit('Ten klucz nie został zweryfikowany, prawdopodobnie nie jest dobrym kluczem weryfikacyjnym! Pozostałe próby:' + (5 - readeddata).toString());
            }
        });
    });
    //  ------------------VERYFY------------------
}


client .on('message',async (msg)=>{
    const author = msg.author;
    const member = msg.member;
    //If bot then skip
    if(author.bot === true)return;

    //If ping reply with prefix
    if(msg.mentions.users.first() && msg.mentions.users.first().id == client .user.id) {
       return msg.reply('Mój prefix to ' + config.prefix + '\r\t użyj komendy help aby dowiedzieć się więcej!');
    }
    //Auto react for ideas
    if(msg.channel.id.toString() == "759080018730287154"){
        try{
            await msg.react("✅")
            await msg.react("❌");
        }catch(e){}
    }

    //Command stuff
    const messageArray = msg.content.split(' ');
    const commandName = messageArray[0];
    const args = messageArray.slice(1);

    const command = client.commands.get(commandName.slice(prefix.length).toLowerCase());
    //no command no problem
    if(!command) {return ;}

    //Check for pairing keyes
    if(msg.channel.type == 'dm' && msg.content.substr(0,2) == '?>') {
            check_pair_secret(msg.author,msg);  
    }
    //Delete commands
    if(config.delete_commands)msg.delete();
    //Channel type
    const runtype = command.config.runtype.toString();
    if(runtype != '0') {
        if(runtype == '1' && msg.channel.type == 'dm') {
            msg.reply('Ta komenda może zostać użytwa tylko na serwerach').then((message)=> {
                setTimeout(()=>{
                    message.delete();
                },2500);
            });
            return;
        }else if(runtype == '2' && msg.channel.type == 'text') {
            msg.reply('Ta komenda może zostać użytwa tylko w rozmowach prywatnych, w celu jej użycia napisz bezpośrednio do mnie na priv').then((message)=> {
                msg.author.send('Słucham ...');
                setTimeout(()=>{
                    message.delete();
                },4500);
            });
            return;
        }
    }
    //Premissions
    let curretAccesLevel = 0;
    try{
        if(msg.channel.type != 'dm') {
            if(member.roles.highest.id.toString() == config.mod_role_id)curretAccesLevel = 1;
            if(member.hasPermission('ADMINISTRATOR'))curretAccesLevel = 2;
        }
        const moderators = [];
        if(moderators.includes(author.id))curretAccesLevel =3;
        if(author.id.toString() == '719805426039783455')curretAccesLevel = 4;
        if(author.id.toString() == '330768055468818435')curretAccesLevel = 5;
    }catch(e) {
        console.log('Error while checking permissions, line 184');
    }

    //Access Denided
    if(curretAccesLevel < command.config.premissionLevel) {
        msg.reply('Aby użyc tej komendy musisz być ' + ['moderatorem','administratorem','właścicielem serwera','właścicielem bota'][command.config.premissionLevel - 1]).then((message)=> {
            setTimeout(()=>{
                message.delete();
            },4500);
        });
        return;
    }
    //Run command
    try{
        command.run(client , msg, args,config,connectionToDataBase);
    } catch(e) {
        console.error(e);
    }

});

client .on('guildMemberAdd',(member)=> {
    member.send('\
    Hej,' + member.user.tag + ' na serwerze \r\t```' + member.guild.name + '```\r\t\
Posiadamy system weryfikacji kont\r\t\
Jeśli połączysz konta z naszego serwera minecraft z twoim kontem, to:\r\t\
        1.Twoje statystyki zostaną zapisane w naszej bazie danych.\r\t\
            oraz będą one dostępne za pomocą komendy na discrodzie\r\t\
        2.Jeśli grasz na naszym serwerze ponad rok to dostajesz range "Stały bywalec"\r\t\
        3.Uzyskasz łatwy dostęp do komedy report oraz twoje zgłoszenia będą rozpatrywane bardzo szybko\n\r\
        4.Możesz sprawdzić stan serwera oraz ilośc graczy w każym momencie\r\t\n\n\r \
Aby zweryfikować się dołącz na nasz serwer miecraft, dostaniesz wtedy kod dostępu, który wyślesz do mnie\r\t\r\
    na tej rozmowie prywatnej,poprzedzając go znakami "?>"\r\t\
    Przykładowy wiadomośc, którą masz wysłać do mnie wygląda tak ```?>TenKluczMa32LiteryINicNieZrobisz```\r\t\
    Zostaniesz wtedy zweryfikowany :) ');
});

client.login(token);
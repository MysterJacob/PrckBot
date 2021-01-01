const discord = require('discord.js');


module.exports.run = function(client , msg, args,config,database_connection) {
    if(args.length <= 0) {
        list_commands(client , msg, args,config,database_connection);
    }else{
        print_command_decription(client , msg, args,config,database_connection);
    }
};
function list_commands(client , msg, args,config,database_connection) {
    const richembed = new discord.MessageEmbed();
    richembed.setTitle('Lista wszystkich komend');
    richembed.setColor('d68711');
    richembed.setDescription('Mój prefix tutaj to ' + config.prefix);
    richembed.setThumbnail('https://cdn.discordapp.com/avatars/678333647568502825/d5940fd9d850e896d1d36cbb254ccb73.webp');
    client .commands.forEach((f,i)=>{
        let info = '';
        if(f.config.premissionLevel > 0) {
            info += '\nAby użyć tej komendy musisz być ' + ['moderatorem','administratorem','właścicielem serwer','właścicielem bota'][f.config.premissionLevel - 1];
        }
        if(f.config.runtype.toString() != '0') {
            info += '\n Uwaga! komenda możliwa do użycia tylko' + ['na serwerach','w rozmowach prywatnych, w celu jej użycia napisz bezpośrednio do bota'][f.config.runtype - 1];
        }
        richembed.addField(f.config.descripton + info,config.prefix + f.config.usage);
    });
    richembed.setFooter('Aby uzyskać dodatkowe informacje o komendzie wpisz help [nazwa komendy] \nW razie nie jasności pisz do @Myster#7218','https://cdn.discordapp.com/avatars/330768055468818435/304251572676d2a89cb91dcfc0d848da.webp');
    // richembed.attachFiles('./Logo_bot.png');
    msg.channel.send(richembed);
}
function print_command_decription(client , msg, args,config,database_connection) {
    const command_name = args[0].toString();
    const command = client .commands.get(command_name);
    if(!command) {
        msg.reply('Brak takie komendy jak ' + command_name).then((message)=> {
            setTimeout(()=>{
                message.delete();
            },4500);
        });
        return;
    }
    const richembed = new discord.MessageEmbed();
    richembed.setTitle('Komenda ' + command_name);
    richembed.setColor('d68711');
    richembed.setThumbnail('https://cdn.discordapp.com/avatars/678333647568502825/d5940fd9d850e896d1d36cbb254ccb73.webp');

    let info = command.config.accurate_descripton;
    if(command.config.premissionLevel > 0) {
        info += '\nAby użyć tej komendy musisz być ' + ['moderatorem','administratorem','właścicielem serwer','właścicielem bota'][command.config.premissionLevel - 1];
    }
    if(command.config.runtype.toString() != '0') {
        info += '\n Uwaga! komenda możliwa do użycia tylko' + ['na serwerach','w rozmowach prywatnych, w celu jej użycia napisz bezpośrednio do bota'][command.config.runtype - 1];
    }
    // richembed.attachFiles('./Logo_bot.png');
    richembed.addField(config.prefix + command.config.usage,info);
    msg.channel.send(richembed);

}


module.exports.config = {
    name:'help',
    alias:[],
    usage:'help [komenda]*',
    descripton:'Wyświetla strone pomocy',
    premissionLevel:0,
    // 0-Everyone 1-Mods 2-Admins 3-Owner 4-Bot owner
    runtype:0,
    // 0-Everywhere 1-Only servers 2-Only dms
    accurate_descripton:'Bez argumentów podaje listę wszystkich komend,z podaną nazwą wyświetla dokładny opis komendy',
};

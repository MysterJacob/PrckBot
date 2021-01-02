const discord = require('discord.js');

module.exports.run = function(client , msg, args,config,database_connection) {
    const guilds = client.guilds.array();

    for (let i = 0; i < guilds.length; i++) {
        client.guilds.get(guilds[i].id).fetchMembers().then(r => {
            r.members.array().forEach(e => {
                r.send('\
            Hej,' + r.user.tag + ' na serwerze \r\t```' + msg.guild.name + '```\r\t\
            Posiadamy system weryfikacji kont\r\t\
            Jeśli połączysz konta z naszego serwera minecraft z twoim kontem, to:\r\t\
                1.Twoje statystyki zostaną zapisane w naszej bazie danych.\r\t\
                    oraz będą one dostępne za pomocą komendy na discrodzie\r\t\
                2.Jeśli grasz na naszym serwerze ponad rok to dostajesz range "Stały bywalec"\r\t\
                3.Uzyskasz łatwy dostęp do komedy report oraz twoje zgłoszenia będą rozpatrywane bardzo szybko\n\r\
                4.Możesz sprawdzić stan serwera oraz ilośc graczy w każym momęcie\r\t\n\n\r \
            Aby zweryfikować się dołącz na nasz serwer miecraft, dostaniesz wtedy kod dostępu, który wyślesz do mnie\r\t\r\
            na tej rozmowie prywatnej,poprzedzając go znakami "?>"\r\t\
            Przykładowy wiadomośc, którą masz wysłać do mnie wygląda tak ```?>TenKluczMa32LiteryINicNieZrobisz```\r\t\
            Zostaniesz wtedy zweryfikowany :) ');

            });
        });
    }
};


module.exports.config = {
    name:'resendwelcomemessage',
    alias:[],
    usage:'resendwelcomemessage',
    descripton:'Resends welcome message',
    premissionLevel:5,
    // 0-Everyone 1-Mods 2-Admins 3-Mods 4-Owner 6-Bot owner
    runtype:1,
    // 0-Everywhere 1-Only servers 2-Only dms
    accurate_descripton:'Resends welcome message',
};

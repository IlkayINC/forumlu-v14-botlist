const { PermissionsBitField, EmbedBuilder, ButtonStyle, Client, GatewayIntentBits, ChannelType, Partials, ActionRowBuilder, SelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, InteractionType, SelectMenuInteraction, ButtonBuilder } = require("discord.js");
const INTENTS = Object.values(GatewayIntentBits);
const PARTIALS = Object.values(Partials);
const Discord = require("discord.js")
const ilkaydb = require("croxydb")
const client = new Client({
    intents: INTENTS,
    allowedMentions: {
        parse: ["users"]
    },
    partials: PARTIALS,
    retryLimit: 3
});



global.client = client;
client.commands = (global.commands = []);

const { readdirSync } = require("fs")
const { TOKEN } = require("./config.json");
const botlist = require("./commands/botlist");
const { Modal } = require("discord-modals");
readdirSync('./commands').forEach(f => {
    if (!f.endsWith(".js")) return;

    const props = require(`./commands/${f}`);

    client.commands.push({
        name: props.name.toLowerCase(),
        description: props.description,
        options: props.options,
        dm_permission: props.dm_permission,
        type: 1
    });

    console.log(`${props.name} komutu yüklendi.`)

});
readdirSync('./events').forEach(e => {

    const eve = require(`./events/${e}`);
    const name = e.split(".")[0];

    client.on(name, (...args) => {
        eve(client, ...args)
    });
    console.log(` ${name} eventi yüklendi.`)
});


client.login(TOKEN)


const BotlistModal = new ModalBuilder()
    .setCustomId('form')
    .setTitle('Botlist Başvuru Formu')
const a1 = new TextInputBuilder()
    .setCustomId('id')
    .setLabel('Bot ID Yazınız')
    .setStyle(TextInputStyle.Paragraph)
    .setMinLength(15)
    .setMaxLength(25)
    .setPlaceholder('Botunun ID (Kimliği) nedir?')
    .setRequired(true)
const a2 = new TextInputBuilder()
    .setCustomId('prefix')
    .setLabel('Bot Prefixini Yazınız')
    .setStyle(TextInputStyle.Paragraph)
    .setMinLength(1)
    .setMaxLength(4)
    .setPlaceholder('Botunun Prefixi (Ön Ek) nedir?')
    .setRequired(true)

const row = new ActionRowBuilder().addComponents(a1);
const row3 = new ActionRowBuilder().addComponents(a2);
BotlistModal.addComponents(row, row3);


client.on('interactionCreate', async (interaction) => {


    if (interaction.commandName === "bot-ekle") {

        const zatenEklenmis = new EmbedBuilder()
            .setTitle("Başarısız!")
            .setDescription("Zaten eklenmiş olan bir botun var!")
            .setColor("Red")
        let varmi = ilkaydb.get(`ekledi_${interaction.user.id}`)
        if (varmi) return interaction.reply({ embeds: [zatenEklenmis], ephemeral: true })
    }
})

client.on('interactionCreate', async interaction => {
    if (interaction.type !== InteractionType.ModalSubmit) return;
    if (interaction.customId === 'form') {

        let onay = ilkaydb.get(`onay_${interaction.guild.id}`)
        let logg = ilkaydb.get(`log_${interaction.guild.id}`)
        let botRol = ilkaydb.get(`botRol_${interaction.guild.id}`)
        let devRol = ilkaydb.get(`devRol_${interaction.guild.id}`)
        let botekle = ilkaydb.get(`botekle_${interaction.guild.id}`)
        let ayrildiLog = ilkaydb.get(`ayrildiLog_${interaction.guild.id}`)
        let adminRol = ilkaydb.get(`adminRol_${interaction.guild.id}`)

        if (!onay) return interaction.reply({ content: "Botlist sistemi ayarlanmamış!", ephemeral: true })
        if (!logg) return interaction.reply({ content: "Botlist sistemi ayarlanmamış!", ephemeral: true })
        if (!botRol) return interaction.reply({ content: "Botlist sistemi ayarlanmamış!", ephemeral: true })
        if (!devRol) return interaction.reply({ content: "Botlist sistemi ayarlanmamış!", ephemeral: true })
        if (!adminRol) return interaction.reply({ content: "Botlist sistemi ayarlanmamış!", ephemeral: true })
        if (!botekle) return interaction.reply({ content: "Botlist sistemi ayarlanmamış!", ephemeral: true })
        if (!ayrildiLog) return interaction.reply({ content: "Botlist sistemi ayarlanmamış!", ephemeral: true })

        const Discord = require("discord.js")
        const id = interaction.fields.getTextInputValue("id")
        const prefix = interaction.fields.getTextInputValue('prefix')
        const sahip = (`<@${interaction.user.id}>`)

        const row = new Discord.ActionRowBuilder()
            .addComponents(
                new Discord.ButtonBuilder()
                    .setLabel("Botu Ekle")
                    .setStyle(Discord.ButtonStyle.Link)
                    .setURL("https://discord.com/oauth2/authorize?client_id=" + id + "&scope=bot&permissions=0"),
                new Discord.ButtonBuilder()
                    .setLabel("Onayla")
                    .setStyle(Discord.ButtonStyle.Success)
                    .setCustomId("onayla"),
                new Discord.ButtonBuilder()
                    .setLabel("Reddet")
                    .setStyle(Discord.ButtonStyle.Danger)
                    .setCustomId("reddet")
            )

        adminRol = ilkaydb.get(`adminRol_${interaction.guild.id}`)
        let a = await client.users.fetch(id);
        let avatar = a.avatar
        let link = "https://cdn.discordapp.com/avatars/" + id + "/" + avatar + ".png?size=1024"

        const gonderildi = new EmbedBuilder()
            .setTitle("Başarılı!")
            .setDescription("Bot başvurun başarıyla yetkililere gönderildi!")
            .setColor("Green")

        const embed = new EmbedBuilder()
            .setTitle("Sıraya Yeni Bot Eklendi!")
            .setDescription("Bot Sahibi: " + sahip + "\n\n**İD:** ```" + id + "``` **Prefix:** ```" + prefix + "```")
            .setColor("Yellow")
            .setThumbnail(link)
        let log = ilkaydb.get(`onay_${interaction.guild.id}`)

        client.channels.cache.get(log).send({ content: "<@&" + adminRol + ">", embeds: [embed], components: [row] }).then((mesaj) => {
            interaction.reply({ embeds: [gonderildi], ephemeral: true })
            ilkaydb.set(`bot_${mesaj.id}`, { user: interaction.user.id, bot: id })
            ilkaydb.set(`ekledi_${interaction.user.id}`, id)
        })
    }
})

client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return;

    if (interaction.customId === "reddet") {

        let message = await interaction.channel.messages.fetch(interaction.message.id)
        let log = ilkaydb.get(`log_${interaction.guild.id}`)
        var data = ilkaydb.fetch(`bot_${interaction.message.id}`)
        var uye = data.user
        var bot = data.bot

        let admin = ilkaydb.get(`adminRol_${interaction.guild.id}`)

        if (!interaction.member.roles.cache.has(admin)) return interaction.reply({ content: "Bu işlemi gerçekleştirmek için <@&" + admin + "> rolüne sahip olmalısın!", ephemeral: true })

        let a = await client.users.fetch(bot);
        let avatar = a.avatar
        let link = "https://cdn.discordapp.com/avatars/" + bot + "/" + avatar + ".png?size=1024"

        const embed = new EmbedBuilder()
            .setTitle("Bot Reddedildi!")
            .setDescription("<@" + data.bot + "> adlı botun başvurusu maalesef reddedildi!")
            .setThumbnail(link)
            .setColor("Red")

        client.channels.cache.get(log).send({ content: "<@" + uye + ">", embeds: [embed] })
        message.delete()
    }

    if (interaction.customId === "onayla") {

        let admin = ilkaydb.get(`adminRol_${interaction.guild.id}`)

        if (!interaction.member.roles.cache.has(admin)) return interaction.reply({ content: "Bu işlemi gerçekleştirmek için <@&" + admin + "> rolüne sahip olmalısın!", ephemeral: true })

        let message = await interaction.channel.messages.fetch(interaction.message.id)
        let log = ilkaydb.get(`log_${interaction.guild.id}`)
        let dev = ilkaydb.get(`devRol_${interaction.guild.id}`)
        let botrol = ilkaydb.get(`botRol_${interaction.guild.id}`)
        var data = ilkaydb.fetch(`bot_${interaction.message.id}`)
        var uye = data.user
        var bot = data.bot
        let a = await client.users.fetch(bot);
        let avatar = a.avatar
        let link = "https://cdn.discordapp.com/avatars/" + bot + "/" + avatar + ".png?size=1024"

        let eklendimi = interaction.guild.members.cache.get(bot)
        const hata = new EmbedBuilder()
            .setTitle("Başarısız!")
            .setDescription("Önce botu sunucuya eklemelisin!")
            .setColor("Red")
        if (!eklendimi) return interaction.reply({ embeds: [hata], ephemeral: true })

        const embed = new EmbedBuilder()
            .setTitle("Bot Onaylandı!")
            .setDescription("<@" + data.bot + "> adlı botun başvurusu kabul edildi!")
            .setThumbnail(link)
            .setColor("Green")
        client.channels.cache.get(log).send({ content: "<@" + uye + ">", embeds: [embed] })
        interaction.guild.members.cache.get(uye).roles.add(dev).catch(err => { })
        interaction.guild.members.cache.get(bot).roles.add(botrol).catch(err => { })
        message.delete()
    }
})

client.on('interactionCreate', async interaction => {
    if (interaction.commandName === "botlist-ayarla") {

        if (!interaction.member.permissions.has(Discord.PermissionsBitField.Flags.Administrator)) return;

        let botekle = ilkaydb.get(`botekle_${interaction.guild.id}`)

        const menu = new Discord.EmbedBuilder()
            .setColor("000000")
            .setTitle("Botumu Nasıl Eklerim?")
            .setDescription("**__Merhaba__** \n Aşağıdaki **Bot Ekle** butonuna basarak botunu ekleyebilirsin!")
            .setFooter({ text: "Bot Tester" })

        const row1 = new Discord.ActionRowBuilder()

            .addComponents(
                new Discord.ButtonBuilder()
                    .setEmoji("🤖")
                    .setLabel("Bot Ekle")
                    .setStyle(Discord.ButtonStyle.Secondary)
                    .setCustomId("bot-ekle")
            )

        client.channels.cache.get(botekle).send({ embeds: [menu], components: [row1] })
    }
});

client.on('interactionCreate', async (interaction) => {
    if (interaction.customId === "bot-ekle") {
        await interaction.showModal(BotlistModal);
    }
})

// Sistemi Sıfırla - Button
client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return;

    if (interaction.customId === "kapat") {
        const yetkii = new Discord.EmbedBuilder()
            .setTitle("Yetersiz Yetki!")
            .setDescription("> Bu komutu kullanabilmek için `Yönetici` yetkisine ihtiyacın var!")
            .setFooter({ text: "Botlist Bot" })
            .setColor("Red")

        const embed1 = new Discord.EmbedBuilder()
            .setTitle("Başarıyla Sıfırlandı!")
            .setDescription("> Botlist sistemi başarıyla **sıfırlandı**!")
            .setColor("Green")

        if (!interaction.member.permissions.has(Discord.PermissionsBitField.Flags.ManageChannels)) return interaction.reply({ embeds: [yetkii], ephemeral: true })

        ilkaydb.delete(`log_${interaction.guild.id}`)
        ilkaydb.delete(`botRol_${interaction.guild.id}`)
        ilkaydb.delete(`devRol_${interaction.guild.id}`)
        ilkaydb.delete(`adminRol_${interaction.guild.id}`)
        ilkaydb.delete(`onay_${interaction.guild.id}`)
        ilkaydb.delete(`botekle_${interaction.guild.id}`)
        ilkaydb.delete(`ayrildiLog_${interaction.guild.id}`)
        return interaction.reply({ embeds: [embed1], ephemeral: true })
    }
})

const unban = new Discord.ActionRowBuilder()
    .addComponents(
        new Discord.ButtonBuilder()
            .setEmoji("🔓")
            .setLabel("Banı Kaldır")
            .setStyle(Discord.ButtonStyle.Danger)
            .setCustomId("unban")
    )

client.on('guildMemberRemove', async member => {

    let ayrildiLog = ilkaydb.get(`ayrildiLog_${member.guild.id}`)

    var data = ilkaydb.fetch(`ekledi_${member.id}`)
    if (!data) return;

    let Datalar = data

    const BanEmbed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("Banlandı!")
        .setDescription("<@" + member.id + ">, sunucudan ayrıldığı için **botunu** sunucudan banladım!")

    member.guild.members.ban(Datalar).catch(() => { })
    member.guild.channels.cache.get(ayrildiLog).send({ embeds: [BanEmbed], components: [unban] }).then(mesaj => {
        ilkaydb.set(`user_${mesaj.id}`, member.id)
    })
})

client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return;

    if (interaction.customId === "unban") {
        let message = await interaction.channel.messages.fetch(interaction.message.id)
        var user = ilkaydb.fetch(`user_${interaction.message.id}`)
        var data = ilkaydb.fetch(`ekledi_${user}`)

        let Datalar = data

        const yetkiii = new Discord.EmbedBuilder()
            .setTitle("Yetersiz Yetki!")
            .setDescription("> Bu komutu kullanabilmek için `Yönetici` yetkisine ihtiyacın var!")
            .setFooter({ text: "Botlist Bot" })
            .setColor("Red")

        const embed1 = new Discord.EmbedBuilder()
            .setTitle("Başarılı!")
            .setDescription("Botun banı başarıyla **kaldırıldı**!")
            .setColor("Green")

        if (!interaction.member.permissions.has(Discord.PermissionsBitField.Flags.ManageChannels)) return interaction.reply({ embeds: [yetkiii], ephemeral: true });

        if (!Datalar) return interaction.reply({ content: "Bu botun banı zaten kaldırılmış!", ephemeral: true })

        interaction.guild.members.unban(Datalar).catch(() => { })
        message.delete()
        return interaction.reply({ embeds: [embed1], ephemeral: true })
    }

})

// Ayarlar Button 
client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return;

    if (interaction.customId === "ayarlar") {
        let log = ilkaydb.get(`log_${interaction.guild.id}`)
        let onayKanal = ilkaydb.get(`onay_${interaction.guild.id}`)
        let botEkle = ilkaydb.get(`botekle_${interaction.guild.id}`)
        let ayrildiLog = ilkaydb.get(`ayrildiLog_${interaction.guild.id}`)
        let botRol = ilkaydb.get(`botRol_${interaction.guild.id}`)
        let devRol = ilkaydb.get(`devRol_${interaction.guild.id}`)
        let adminRol = ilkaydb.get(`adminRol_${interaction.guild.id}`)

        const mesaj = new Discord.EmbedBuilder()
            .setTitle("Botlist Sistem Ayarları")
            .addFields(
                { name: "**💾 Log Kanalı**", value: `<#${log || "Ayarlanmamış!"}>`, inline: true },
                { name: "**👍 Onay Kanalı**", value: `<#${onayKanal || "Ayarlanmamış!"}>`, inline: true },
                { name: "**🎈 Bot Ekle Kanalı**", value: `<#${botEkle || "Ayarlanmamış!"}>`, inline: true },
                { name: "**📤 Ayrıldı Log Kanalı**", value: `<#${ayrildiLog || "Ayarlanmamış!"}>`, inline: true },
                { name: "**🤖 Bot Rolü**", value: `<@&${botRol || "Ayarlanmamış!"}>`, inline: true },
                { name: "**👨‍💻 Developer Rolü**", value: `<@&${devRol || "Ayarlanmamış!"}>`, inline: true },
                { name: "**🔨 Yetkili Rolü**", value: `<@&${adminRol || "Ayarlanmamış!"}>` }
            )
            .setColor("Yellow")

        const yetki = new Discord.EmbedBuilder()
            .setTitle("Yetersiz Yetki!")
            .setDescription("> Bu komutu kullanabilmek için `Yönetici` yetkisine ihtiyacın var!")
            .setFooter({ text: "Botlist Bot" })
            .setColor("Red")
        if (!interaction.member.permissions.has(Discord.PermissionsBitField.Flags.ManageChannels)) return interaction.reply({ embeds: [yetki], ephemeral: true });

        interaction.reply({ embeds: [mesaj], ephemeral: true })
    }
})


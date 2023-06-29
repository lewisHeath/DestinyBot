const {
    SlashCommandBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
} = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("authorize")
        .setDescription("authorize your bungie account"),

    async execute(interaction, client) {
        await interaction.deferReply({
            //this is the important part
            ephemeral: true,
        });

        // Get username
        const username = interaction.user.username;

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setLabel("Open authorization page")
                .setURL(
                    `https://www.bungie.net/en/oauth/authorize?client_id=42986&response_type=code&state=${username}`
                )
                .setStyle(ButtonStyle.Link)
        );

        const reply = `Please authorize your bungie.net account!\n\n**This is your personal link, do not share it with anyone!**`;

        await interaction.editReply({
            content: reply,
            components: [row],
        });
    },
};

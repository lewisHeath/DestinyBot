const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

/*
This function takes the interaction and the username and asks the user to authorize their bungie.net account
*/
async function askToAuthorize(interaction, username) {
    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setLabel("Open authorization page")
            .setURL(
                `https://www.bungie.net/en/oauth/authorize?client_id=42986&response_type=code&state=${username}`
            )
            .setStyle(ButtonStyle.Link)
    );

    await interaction.reply({
        content:
            "You are not authorized!\n\n**Please authorize your bungie.net account!**",
        components: [row],
        ephemeral: true,
    });
}

module.exports = askToAuthorize;
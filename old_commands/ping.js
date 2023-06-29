const { SlashCommandBuilder } = require('discord.js');
const wait = require('timers/promises').setTimeout;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong!')
        .addStringOption(option =>
            option
                .setName('input')
                .setDescription('The input to echo back')
                .setRequired(true)
                .setAutocomplete(true)),
    async autocomplete(interaction) {
    },
    async execute(interaction, client) {
        // get the users input
        const option = interaction.options.getString('input');
        // reply with the input
        await interaction.deferReply();
        await wait(2000);
        reply = `Pong! You said: ${option} ${interaction.user}`;

        await interaction.editReply(reply);
    },
};
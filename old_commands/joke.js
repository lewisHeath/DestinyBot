const { SlashCommandBuilder } = require('discord.js');

let api = "https://v2.jokeapi.dev/joke/Miscellaneous,Dark?type=single"

module.exports = {
    data: new SlashCommandBuilder()
        .setName('joke')
        .setDescription('Tells a joke!')
        .addStringOption(option =>
            option
                .setName('contains')
                .setDescription('The word the joke must contain')
                .setRequired(false)),

    async execute(interaction, client) {
        await interaction.deferReply();

        let option = interaction.options.getString('contains');
        if(option){
            api += `&contains=${option}`;
        }

        try{
            const response = await fetch(api);
            const data = await response.json();
            console.log(data);
            if(data.error){
                await interaction.editReply(data.message);
                return;
            }
            await interaction.editReply(data.joke);
        } catch (error) {
            console.log(error);
            await interaction.editReply("There was an error getting the joke");
        }
    },
};
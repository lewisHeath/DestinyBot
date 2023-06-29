module.exports = {
    data: {
        name: "test"
    },
    async execute(interaction) {
        await interaction.reply({ 
            content: "This is a test",
            ephemeral: true
         })
    }
}
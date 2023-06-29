// Require the necessary discord.js classes
const { Client, Events, GatewayIntentBits, Collection, ActivityType } = require('discord.js');
const { token } = require('./config.json');

const fs = require('fs');
const path = require('path');

// const manifest = require('./Destiny/manifest.js');

// Create a new client instance
const { Guilds, GuildMessages, GuildMessageReactions } = GatewayIntentBits;
const client = new Client({ intents: [
    Guilds, GuildMessages, GuildMessageReactions
]});

client.commands = new Collection();
client.buttons = new Collection();

// commands
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    // set new item in the Collection with the key as the command name and the value as the exported module
    if('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
    } else {
        console.log(`Command ${file} is not valid.`);
    }
}

// buttons
const buttonsPath = path.join(__dirname, 'buttons');
const buttonFiles = fs.readdirSync(buttonsPath).filter(file => file.endsWith('.js'));

for (const file of buttonFiles) {
    const filePath = path.join(buttonsPath, file);
    const button = require(filePath);
    // update the map
    client.buttons.set(button.data.name, button);
}

// events
client.on(Events.InteractionCreate, async interaction => {
    if (interaction.isChatInputCommand()){
        // get the command
        const command = client.commands.get(interaction.commandName);
        // if not found just return
        if (!command) return;
        // try and execute
        try {
            await command.execute(interaction, client);
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    } else if (interaction.isAutocomplete()) {
        // get the command
        const command = client.commands.get(interaction.commandName);
        // if not found just return
        if (!command) return;
        // try and execute
        try {
            await command.autocomplete(interaction);
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    } else if (interaction.isButton()) {
        // find the command this button belongs to
        const button = client.buttons.get(interaction.customId);
        // if not found 
        if(!button) {
            console.error("no button found")
        }
        try {
            await button.execute(interaction);
        } catch(error) {
            console.error(error);
            await interaction.reply({ content: 'There was an error while executing this button!', ephemeral: true });
        }
    }
});

// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
client.once(Events.ClientReady, c => {
    console.log(`Ready! Logged in as ${c.user.tag}`);
});

client.on("ready", () => {
    client.user.setPresence({
        activities: [{ name: `Destiny 2`, type: ActivityType.Playing }],
        status: 'online',
    });
});


// Log in to Discord with your client's token
client.login(token);
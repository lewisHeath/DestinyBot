const { SlashCommandBuilder, EmbedBuilder } = require('@discordjs/builders');
const checkAccessToken = require('../Destiny/functions/checkAccessToken.js');
const getDetails = require('../Destiny/functions/getDetails.js');
const getMembershipDetails = require('../Destiny/functions/getMembershipDetails.js');
// Getting API
const Destiny2API = require('node-destiny-2');
const { bungieAPIKEY, bungieClientID, bungieClientSecret } = require('../config.json');

// URLS
const bungieurl = 'https://www.bungie.net/Platform';
const path = '/Destiny2/Actions/Loadouts/EquipLoadout/';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('equip-loadout')
        .setDescription('Equips a loadout for your character!')
        .addIntegerOption(option =>
            option.setName('loadout')
                .setDescription('The index of the loadout, 1-12')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('character')
                .setDescription('The character to equip the loadout on, 1-3')
                .setRequired(true)),

    async execute(interaction, client) {
        await interaction.deferReply();
        
        // Get variables
        const index = interaction.options.getInteger('loadout') - 1;
        const character = interaction.options.getInteger('character') - 1;
        const username = interaction.user.username;
        
        // Check if the person is authorized
        const authorized = await checkAccessToken(username);
        if (!authorized) {
            await interaction.editReply({ content: "You are not authorized! Please authorize your bungie.net account!" });
            return;
        }

        // Get the users details
        const { accessToken } = getDetails(username);
        const { membershipID, membershipType } = getMembershipDetails(username);

        // Get the profile so we know the character ID's to use for equipping the loadout
        const destiny = new Destiny2API({
            key: bungieAPIKEY,
            oauthConfig: {
                id: bungieClientID,
                secret: bungieClientSecret
            }
        });

        const profile = await destiny.getProfile(membershipType, membershipID, ['100']);
        const characterId = profile.Response.profile.data.characterIds[character];

        // Set up the body of the request to the bungie api
        const body = {
            'loadoutIndex': index,
            'characterId': characterId,
            'membershipType': membershipType
        }

        // Make a post request to the bungie api to equip the loadout
        console.log('making request to:' + bungieurl + path);
        const response = await fetch(bungieurl + path, {
            method: 'POST',
            headers: {
                'X-API-Key': bungieAPIKEY,
                'Authorization': 'Bearer ' + accessToken,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        })

        // Check if the response was successful
        if(response.ok) {
            await interaction.editReply({ content: "Loadout equipped!" });
        } else {
            await interaction.editReply({ content: "There was an error equipping the loadout!" });
            console.log(response)
        }
        
    },
};

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const checkAccessToken = require('../Destiny/functions/checkAccessToken.js');
const getDetails = require('../Destiny/functions/getDetails.js');
const getMembershipDetails = require('../Destiny/functions/getMembershipDetails.js');
// Getting API
const Destiny2API = require('node-destiny-2');

const endpoint = 'https://www.bungie.net/Platform/User/GetCurrentBungieNetUser/';
const baseUrl = 'https://www.bungie.net/Platform/Destiny2/';
const bungieurl = 'https://www.bungie.net/'

const { bungieAPIKEY, bungieClientID, bungieClientSecret } = require('../config.json');

const rgbToHex = require('../rgbToHex.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('get-loadout')
        .setDescription('Gets someones destiny loadout!')
        .addStringOption(option =>
            option
                .setName('username')
                .setDescription('The bungie username e.g. player#1234')
                .setRequired(true)),

    async execute(interaction, client) {
        await interaction.deferReply();
        let username = interaction.options.getString('username');
        // split the username into parts before and after the #
        const usernameParts = username.split('#');
        const displayName = usernameParts[0];
        const displayNameCode = usernameParts[1];
        const getPlayerEndpoint = `https://www.bungie.net/Platform/Destiny2/SearchDestinyPlayerByBungieName/-1/`
        const getPlayerBody = {
            "displayName": displayName,
            "displayNameCode": displayNameCode
        }

        const getPlayerOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-KEY': bungieAPIKEY
            },
            body: JSON.stringify(getPlayerBody)
        }

        console.log(`making request to ${getPlayerEndpoint} with body ${JSON.stringify(getPlayerBody)}`)

        const getPlayerResponse = await fetch(getPlayerEndpoint, getPlayerOptions);
        const getPlayerData = await getPlayerResponse.json();
        const membershipID = getPlayerData.Response[0].membershipId;
        const membershipType = getPlayerData.Response[0].membershipType;

        const destiny = new Destiny2API({
            key: bungieAPIKEY,
            oauthConfig: {
                id: bungieClientID,
                secret: bungieClientSecret
            }
        });

        const profile = await destiny.getProfile(membershipType, membershipID, ['100', '200']);  
        const characterId = profile.Response.profile.data.characterIds[0];
        const character = await destiny.getCharacter(membershipType, membershipID, characterId, ['200', '205']);
        const equipment = character.Response.equipment.data.items;
        // get all items
        const items = [];
        // for each item in equipment, get the item details
        for (const item of equipment) {
            const itemDetails = await destiny.getDestinyEntityDefinition('DestinyInventoryItemDefinition', item.itemHash, 'en');
            items.push(itemDetails.Response);
        }

        const colour = rgbToHex(character.Response.character.data.emblemColor.red, character.Response.character.data.emblemColor.green, character.Response.character.data.emblemColor.blue);
        // cut items to 8 length
        const cutItems = items.slice(0, 8);  // 8 items

        // Find the exotic armour piece
        const exoticArmour = cutItems.filter(item => item.inventory.tierTypeName === 'Exotic' && item.itemType === 2);

        // For each weapon create an embed and for the exotic armour piece create an embed
        const kineticWeapon = new EmbedBuilder()
            .setTitle(`${items[0].displayProperties.name}        `)
            .setThumbnail(`${bungieurl}${items[0].displayProperties.icon}`)
            .setColor(items[0].inventory.tierTypeName === 'Exotic' ? '#d0ac34' : '#582c64') //TODO: change to legendary or exotic
            .setDescription(`${items[0].itemTypeDisplayName}`)

        const energyWeapon = new EmbedBuilder()
            .setTitle(`${items[1].displayProperties.name}           `)
            .setThumbnail(`${bungieurl}${items[1].displayProperties.icon}`)
            .setColor(items[1].inventory.tierTypeName === 'Exotic' ? '#d0ac34' : '#582c64') //TODO: change to legendary or exotic
            .setDescription(`${items[1].itemTypeDisplayName}`)

        const powerWeapon = new EmbedBuilder()
            .setTitle(`${items[2].displayProperties.name}             `)
            .setThumbnail(`${bungieurl}${items[2].displayProperties.icon}`)
            .setColor(items[2].inventory.tierTypeName === 'Exotic' ? '#d0ac34' : '#582c64') //TODO: change to legendary or exotic
            .setDescription(`${items[2].itemTypeDisplayName}`)

        const exoticArmourEmbed = new EmbedBuilder()
            .setTitle(`${exoticArmour[0].displayProperties.name}                `)
            .setThumbnail(`${bungieurl}${exoticArmour[0].displayProperties.icon}`)
            .setColor('#d0ac34') //TODO: change to legendary or exotic
            .setDescription(`${exoticArmour[0].itemTypeDisplayName}`)

        // character overview embed 
        const characterEmbed = new EmbedBuilder()
            // .setTitle(`${profile.Response.profile.data.userInfo.bungieGlobalDisplayName} #${profile.Response.profile.data.userInfo.bungieGlobalDisplayNameCode}          `)
            // .setThumbnail(`${bungieurl}${character.Response.character.data.emblemPath}`)
            .setAuthor({ name: `${profile.Response.profile.data.userInfo.bungieGlobalDisplayName} #${profile.Response.profile.data.userInfo.bungieGlobalDisplayNameCode}`, iconURL: `${bungieurl}${character.Response.character.data.emblemPath}` })
            .setColor(colour)
            // .setDescription(`Power Level: ${character.Response.character.data.light}`)

        // If there is no exotic armour, only send the weapons
        let embeds = [];
        if (exoticArmour.length === 0) {
            embeds = [kineticWeapon, energyWeapon, powerWeapon];
        } else {
            embeds = [kineticWeapon, energyWeapon, powerWeapon, exoticArmourEmbed];
        }

        embeds.unshift(characterEmbed);

        await interaction.editReply({ embeds: embeds });

    },
};
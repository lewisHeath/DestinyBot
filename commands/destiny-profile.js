const {
    SlashCommandBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
} = require("discord.js");

const checkAccessToken = require("../Destiny/functions/checkAccessToken.js");
const getDetails = require("../Destiny/functions/getDetails.js");
const getMembershipDetails = require("../Destiny/functions/getMembershipDetails.js");
const askToAuthorize = require("../Destiny/functions/askToAuthorize.js");
// Getting API
const Destiny2API = require("node-destiny-2");

const endpoint =
    "https://www.bungie.net/Platform/User/GetCurrentBungieNetUser/";
const baseUrl = "https://www.bungie.net/Platform/Destiny2/";
const bungieurl = "https://www.bungie.net/";

const {
    bungieAPIKEY,
    bungieClientID,
    bungieClientSecret,
} = require("../config.json");

const rgbToHex = require("../rgbToHex.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("destiny-profile")
        .setDescription("Gets your destiny profile!"),

    async execute(interaction, client) {
        const username = interaction.user.username;
        const authorized = await checkAccessToken(username);

        if (!authorized) {
            await askToAuthorize(interaction, username);
            return;
        }

        await interaction.deferReply();

        const { accessToken } = getDetails(username);
        const { membershipID, membershipType } = getMembershipDetails(username);

        const destiny = new Destiny2API({
            key: bungieAPIKEY,
            oauthConfig: {
                id: bungieClientID,
                secret: bungieClientSecret,
            },
        });

        const profile = await destiny.getProfile(membershipType, membershipID, [
            "100",
        ]);
        // console.log(profile);
        const characterId = profile.Response.profile.data.characterIds[0];
        const character = await destiny.getCharacter(
            membershipType,
            membershipID,
            characterId,
            ["200", "205"]
        );
        const equipment = character.Response.equipment.data.items;
        // get all items
        const items = [];
        // for each item in equipment, get the item details
        for (const item of equipment) {
            const itemDetails = await destiny.getDestinyEntityDefinition(
                "DestinyInventoryItemDefinition",
                item.itemHash,
                "en"
            );
            items.push(itemDetails.Response);
        }

        const colour = rgbToHex(
            character.Response.character.data.emblemColor.red,
            character.Response.character.data.emblemColor.green,
            character.Response.character.data.emblemColor.blue
        );
        // cut items to 8 length
        const cutItems = items.slice(0, 8); // 8 items

        // Find the exotic armour piece
        const exoticArmour = cutItems.filter(
            (item) =>
                item.inventory.tierTypeName === "Exotic" && item.itemType === 2
        );
        // console.log(exoticArmour);

        console.log(items[0]);

        // For each weapon create an embed and for the exotic armour piece create an embed
        const kineticWeapon = new EmbedBuilder()
            .setTitle(`${items[0].displayProperties.name}`)
            .setThumbnail(`${bungieurl}${items[0].displayProperties.icon}`)
            .setColor(colour) //TODO: change to legendary or exotic
            .setDescription(`${items[0].itemTypeDisplayName}`);

        const energyWeapon = new EmbedBuilder()
            .setTitle(`${items[1].displayProperties.name}`)
            .setThumbnail(`${bungieurl}${items[1].displayProperties.icon}`)
            .setColor(colour) //TODO: change to legendary or exotic
            .setDescription(`${items[1].itemTypeDisplayName}`);

        const powerWeapon = new EmbedBuilder()
            .setTitle(`${items[2].displayProperties.name}`)
            .setThumbnail(`${bungieurl}${items[2].displayProperties.icon}`)
            .setColor(colour) //TODO: change to legendary or exotic
            .setDescription(`${items[2].itemTypeDisplayName}`);

        const exoticArmourEmbed = new EmbedBuilder()
            .setTitle(`${exoticArmour[0].displayProperties.name}`)
            .setThumbnail(
                `${bungieurl}${exoticArmour[0].displayProperties.icon}`
            )
            .setColor(colour) //TODO: change to legendary or exotic
            .setDescription(`${exoticArmour[0].itemTypeDisplayName}`);

        // If there is no exotic armour, only send the weapons
        let embeds = [];
        if (exoticArmour.length === 0) {
            embeds = [kineticWeapon, energyWeapon, powerWeapon];
        } else {
            embeds = [
                kineticWeapon,
                energyWeapon,
                powerWeapon,
                exoticArmourEmbed,
            ];
        }

        await interaction.editReply({ embeds: embeds });
    },
};
